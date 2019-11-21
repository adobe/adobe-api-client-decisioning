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

const { BaseClient } = require('@adobe/api-client-base');
const { DecisioningSchemas } = require('./constants');

module.exports = class Offers extends BaseClient {
  constructor(fetch, opts) {
    super(fetch, opts);
    this.defaultContainerId = opts.containerId;
  }

  _default() {
    return {
      name: 'offers',
      rootPath: '/data/core/xcore',
      headers: {
        'x-sandbox-name': 'prod'
      }
    };
  }

  getHome(parameters = {}) {
    const path = this.addParamsToPath('/', parameters);
    return this.get(path);
  }

  getInstances(schema, parameters = {}, containerId = this.defaultContainerId) {
    const path = this.addParamsToPath(
      `/${containerId}/instances`,
      Object.assign(
        {
          schema: schema
        },
        parameters
      )
    );
    return this.get(path);
  }

  getInstance(instanceId, containerId = this.defaultContainerId) {
    if (instanceId.startsWith(`${this.endpoint}/${containerId}/instances/`)) {
      return this.get(instanceId);
    } else {
      return this.get(`/${containerId}/instances/${instanceId}`);
    }
  }

  getActivities(parameters = {}, containerId = this.defaultContainerId) {
    return this.getInstances(
      DecisioningSchemas.Activity,
      parameters,
      containerId
    );
  }

  getFallbackOffers(parameters = {}, containerId = this.defaultContainerId) {
    return this.getInstances(
      DecisioningSchemas.FallbackOffer,
      parameters,
      containerId
    );
  }

  getOffers(parameters = {}, containerId = this.defaultContainerId) {
    return this.getInstances(
      DecisioningSchemas.PersonalizedOffer,
      parameters,
      containerId
    );
  }

  getPlacements(parameters = {}, containerId = this.defaultContainerId) {
    return this.getInstances(
      DecisioningSchemas.Placement,
      parameters,
      containerId
    );
  }

  getFilters(parameters = {}, containerId = this.defaultContainerId) {
    return this.getInstances(
      DecisioningSchemas.Filter,
      parameters,
      containerId
    );
  }

  createInstance(payload, schema, containerId = this.defaultContainerId) {
    return this.post(`/${containerId}/instances`, payload, true, {
      headers: {
        'content-type': `application/vnd.adobe.platform.xcore.hal+json; schema="${schema}"`
      }
    });
  }
};
