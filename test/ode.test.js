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

const { ODE } = require('../index');
const adobefetch = require('@adobe/fetch');

adobefetch.normalizeHeaders = require.requireActual(
  '@adobe/fetch'
).normalizeHeaders;

const querystring = require('querystring');

const DUMMY_CONTAINER = 'fake-container-id';
const DUMMY_CONTAINER2 = 'fake-container-id2';
const ODE_PREFIX = 'https://platform.adobe.io/data/core/ode';
const DEFAULT_OPTS = {
  containerId: DUMMY_CONTAINER
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
  const client = new ODE(adobefetch.config(), opts);
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
  const client = new ODE(adobefetch.config(), opts);
  await func(client);
}

describe('Validate Headers', () => {
  test('Defaults to Prod Sandbox', async () =>
    await expectHeader(
      client => client.diagnostics(),
      'x-sandbox-name',
      'prod'
    ));

  test('Can override Sandbox name', async () =>
    await expectHeader(
      client => client.diagnostics(),
      'x-sandbox-name',
      'dev',
      {
        headers: { 'x-sandbox-name': 'dev' }
      }
    ));
});

describe('Validate diagnostics', () => {
  test('Calls diagnostics API', async () =>
    await expectUrlAndMethod(
      client => client.diagnostics(),
      `${ODE_PREFIX}/${DUMMY_CONTAINER}/diagnostics`
    ));

  test('Override container ID', async () =>
    await expectUrlAndMethod(
      client => client.diagnostics(DUMMY_CONTAINER2),
      `${ODE_PREFIX}/${DUMMY_CONTAINER2}/diagnostics`
    ));
});

describe('Validate offers', () => {
  test('Get offers', async () =>
    await expectUrlAndMethod(
      client => client.offers('some-activity'),
      `${ODE_PREFIX}/${DUMMY_CONTAINER}/offers?activityId=some-activity`
    ));

  test('Override Container ID', async () =>
    await expectUrlAndMethod(
      client => client.offers('some-activity', DUMMY_CONTAINER2),
      `${ODE_PREFIX}/${DUMMY_CONTAINER2}/offers?activityId=some-activity`
    ));
});

describe('Validate decisions', () => {
  test('Get decisions', async () => {
    const payload = {
      'xdm:offerActivities': [
        {
          'xdm:offerActivity': 'some-activity'
        }
      ]
    };
    await expectUrlAndMethod(
      client => client.decisions(payload),
      `${ODE_PREFIX}/${DUMMY_CONTAINER}/decisions`,
      'POST',
      DEFAULT_OPTS,
      payload
    );
  });

  test('Override Container', async () => {
    const payload = {
      'xdm:offerActivities': [
        {
          'xdm:offerActivity': 'some-activity'
        }
      ]
    };
    await expectUrlAndMethod(
      client => client.decisions(payload, DUMMY_CONTAINER2),
      `${ODE_PREFIX}/${DUMMY_CONTAINER2}/decisions`,
      'POST',
      DEFAULT_OPTS,
      payload
    );
  });
});
