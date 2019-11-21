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

module.exports = class ODE extends BaseClient {
  constructor(fetch, opts) {
    super(fetch, opts);
    this.defaultContainerId = this.opts.containerId;
  }

  _default() {
    return {
      name: 'ode',
      rootPath: '/data/core/ode',
      headers: {
        'x-sandbox-name': 'prod'
      }
    };
  }

  decisions(payload, containerId = this.defaultContainerId) {
    return this.post(`/${containerId}/decisions`, payload, true, {
      headers: { Accept: 'application/json, application/problem+json' }
    });
  }

  offers(activityId, containerId = this.defaultContainerId) {
    return this.get(`/${containerId}/offers?activityId=${activityId}`);
  }

  diagnostics(containerId = this.defaultContainerId) {
    return this.get(`/${containerId}/diagnostics`);
  }
};
