/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Offers, DecisioningSchemas } = require('../index');
const adobefetch = require('@adobe/fetch');

adobefetch.normalizeHeaders = require.requireActual(
  '@adobe/fetch'
).normalizeHeaders;

const querystring = require('querystring');

const DUMMY_CONTAINER = 'fake-container-id';
const DUMMY_CONTAINER2 = 'fake-container-id2';
const XCORE_PREFIX = 'https://platform.adobe.io/data/core/xcore';
const DEFAULT_OPTS = {
  containerId: DUMMY_CONTAINER
};

const CREATE_INSTANCE_PAYLOAD = {
  _instance: {
    'xdm:name': 'Activity'
  }
};

jest.mock('@adobe/fetch');

function mockFetch(validationFn, returnValue) {
  adobefetch.config.mockImplementation(() => {
    return async (url, options) => {
      if (typeof validationFn === 'function') {
        validationFn(url, options);
      }
      if (returnValue) {
        if (typeof returnValue === 'function') {
          return returnValue(url, options);
        } else {
          return returnValue;
        }
      } else {
        return {
          ok: true,
          json: async () => {
            return {
              result: 'some result'
            };
          }
        };
      }
    };
  });
}

async function expectUrlAndMethod(
  func,
  expectedUrl,
  expectedMethod = 'GET',
  opts = DEFAULT_OPTS,
  expectedBody = undefined
) {
  const [expectedPath, expectedQuery] = expectedUrl.split('?');
  let assertions = 2;
  if (expectedQuery) {
    assertions++;
  }
  if (expectedBody) {
    assertions++;
  }
  expect.assertions(assertions);
  mockFetch((url, options) => {
    expect(options.method).toBe(expectedMethod);
    const [path, query] = url.split('?');
    expect(path).toBe(expectedPath);
    if (query || expectedQuery) {
      expect(querystring.parse(query)).toStrictEqual(
        querystring.parse(expectedQuery)
      );
    }
    if (expectedBody) {
      expect(options.body).toBe(JSON.stringify(expectedBody));
    }
  });
  const client = new Offers(adobefetch.config(), opts);
  await func(client);
}

async function expectHeader(
  func,
  expectedHeader,
  expectedValue,
  opts = DEFAULT_OPTS
) {
  expect.assertions(2);
  mockFetch((url, options) => {
    expect(options.headers).toBeDefined();
    expect(options.headers[expectedHeader]).toBe(expectedValue);
  });
  const client = new Offers(adobefetch.config(), opts);
  await func(client);
}

describe('Validate Headers', () => {
  test('Defaults to Prod Sandbox', async () =>
    await expectHeader(client => client.getHome(), 'x-sandbox-name', 'prod'));

  test('Can override Sandbox name', async () =>
    await expectHeader(client => client.getHome(), 'x-sandbox-name', 'dev', {
      headers: { 'x-sandbox-name': 'dev' }
    }));
});

describe('Validate home', () => {
  test('Calls home API', async () =>
    await expectUrlAndMethod(client => client.getHome(), `${XCORE_PREFIX}/`));

  test('Calls home with params', async () =>
    await expectUrlAndMethod(
      client => client.getHome({ product: 'dma_offers' }),
      `${XCORE_PREFIX}/?product=dma_offers`
    ));

  test('Override container ID', async () =>
    await expectUrlAndMethod(
      client => client.getHome(DUMMY_CONTAINER2),
      `${XCORE_PREFIX}/`
    ));
});

describe('Validate get instances', () => {
  test('Get instances', async () =>
    await expectUrlAndMethod(
      client => client.getInstances(DecisioningSchemas.Filter),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances?schema=${DecisioningSchemas.Filter}`
    ));

  test('Get instances with parameters', async () =>
    await expectUrlAndMethod(
      client =>
        client.getInstances(DecisioningSchemas.Filter, { id: 'test@id' }),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances?schema=${DecisioningSchemas.Filter}&id=test%40id`
    ));

  test('Get instances with container', async () =>
    await expectUrlAndMethod(
      client =>
        client.getInstances(DecisioningSchemas.Filter, {}, DUMMY_CONTAINER2),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER2}/instances?schema=${DecisioningSchemas.Filter}`
    ));
});

describe('Validate get instance by ID', () => {
  test('Get instance by ID only', async () =>
    await expectUrlAndMethod(
      client => client.getInstance('some-instance-id'),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances/some-instance-id`
    ));

  test('Get instance by full URL', async () =>
    await expectUrlAndMethod(
      client =>
        client.getInstance(
          `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances/some-instance-id`
        ),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances/some-instance-id`
    ));
});

describe('Validate get instances by schema', () => {
  async function verifyGetObject(schema, funcName) {
    await expectUrlAndMethod(
      client => client[funcName](),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances?schema=${schema}`
    );
    await expectUrlAndMethod(
      client => client[funcName]({}, DUMMY_CONTAINER2),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER2}/instances?schema=${schema}`
    );
    await expectUrlAndMethod(
      client => client[funcName]({ param: 'value' }, DUMMY_CONTAINER2),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER2}/instances?schema=${schema}&param=value`
    );
    expect.assertions(9);
  }

  test('Get activites', async () =>
    await verifyGetObject(DecisioningSchemas.Activity, 'getActivities'));

  test('Get offers', async () =>
    await verifyGetObject(DecisioningSchemas.PersonalizedOffer, 'getOffers'));

  test('Get fallbacks', async () =>
    await verifyGetObject(
      DecisioningSchemas.FallbackOffer,
      'getFallbackOffers'
    ));

  test('Get placements', async () =>
    await verifyGetObject(DecisioningSchemas.Placement, 'getPlacements'));

  test('Get filters', async () =>
    await verifyGetObject(DecisioningSchemas.Filter, 'getFilters'));
});

describe('Validate create instances', () => {
  test('Create instance', async () => {
    await expectUrlAndMethod(
      client =>
        client.createInstance(
          CREATE_INSTANCE_PAYLOAD,
          DecisioningSchemas.Activity
        ),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER}/instances`,
      'POST',
      DEFAULT_OPTS,
      CREATE_INSTANCE_PAYLOAD
    );
  });

  test('Create instance use correct header', async () => {
    await expectHeader(
      client => {
        return client.createInstance(
          CREATE_INSTANCE_PAYLOAD,
          DecisioningSchemas.Activity
        );
      },
      'content-type',
      `application/vnd.adobe.platform.xcore.hal+json; schema="${DecisioningSchemas.Activity}"`
    );
  });

  test('Create instance in another container', async () => {
    await expectUrlAndMethod(
      client =>
        client.createInstance(
          CREATE_INSTANCE_PAYLOAD,
          DecisioningSchemas.Activity,
          DUMMY_CONTAINER2
        ),
      `${XCORE_PREFIX}/${DUMMY_CONTAINER2}/instances`,
      'POST',
      DEFAULT_OPTS,
      CREATE_INSTANCE_PAYLOAD
    );
  });
});
