[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
[![Version](https://img.shields.io/npm/v/@adobe/api-client-decisioning.svg)](https://npmjs.org/package/@adobe/api-client-decisioning)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/api-client-decisioning.svg)](https://npmjs.org/package/@adobe/api-client-decisioning)
[![Build Status](https://travis-ci.org/adobe/adobe-api-client-decisioning.svg?branch=master)](https://travis-ci.com/adobe/adobe-api-client-decisioning)
[![codecov](https://codecov.io/gh/adobe/adobe-api-client-decisioning/branch/master/graph/badge.svg)](https://codecov.io/gh/adobe/adobe-api-client-decisioning)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/adobe-api-client-decisioning.svg)](https://greenkeeper.io/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/adobe-api-client-decisioning.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/adobe-api-client-decisioning/context:javascript)

# api-client-decisioning

[Adobe Decisioning Service API](https://www.adobe.io/apis/experienceplatform/home/services/decisioning-service.html) client for NodeJS/Javascript

## Goals

A robust, straightforward API client for building applications on top of the Decisioning Service in Javascript/NodeJS. This client can be used both server & client side.

This package is build upon [adobe-fetch](https://github.com/adobe/adobe-fetch) which handles the low level API call, JWT authentication, token caching and storage.  

### Installation

```
npm install --save @adobe/api-client-decisioning
```

### Common Usage

This package exposes 2 separate clients:

* Offers - CRUD operations on the Offer object modules. This client calls APIs under **/data/core/xcore**.
* ODE - Offer Decisioning Engine. This client calls APIs under **/data/core/ode**.

#### Instantiation

* Option A - Provide an adobefetch instance:

```javascript

    const { Offers, ODE } = require('@adobe/api-client-decisioning');
    
    const config = { 
      auth: { ... See adobe/fetch documentation for details ... }
    };
    
    const adobefetch = require('@adobe/fetch').config(config);
    const ode = new ODE(adobefetch, { containerId: MY_CONTAINER_ID });
    const offers = new Offers(adobefetch, { containerId: MY_CONTAINER_ID });

    const allActivities = await offers.getActivities();
    
```

* Option B - Provide the auth configuration, adobefetch will be instantiated automatically:

```javascript

    const { Offers, ODE } = require('@adobe/api-client-decisioning');
    
    const ode = new ODE(adobefetch, { 
      auth: { ... See adobe/fetch documentation for details ... }, 
      containerId: MY_CONTAINER_ID
    });

    const offers = new Offers(adobefetch, { 
      auth: { ... See adobe/fetch documentation for details ... }, 
      containerId: MY_CONTAINER_ID
    });
    
    const allActivities = await offers.getActivities(); 

```

#### More information about Decisioning APIs.

* [Manage Decisioning Objects](https://www.adobe.io/apis/experienceplatform/home/tutorials/alltutorials.html#!api-specification/markdown/narrative/tutorials/decisioning_tutorial/decisioning_entities_api_tutorial.md)
* [Using the Decisioning Service runtime](https://www.adobe.io/apis/experienceplatform/home/tutorials/alltutorials.html#!api-specification/markdown/narrative/tutorials/decisioning_tutorial/decisioning_runtime_api_tutorial.md)
* [ODE API Spec](https://www.adobe.io/apis/experienceplatform/home/api-reference.html#!acpdr/swagger-specs/decisioning-ode.yaml)
* [Offers Core Objects API Spec](https://www.adobe.io/apis/experienceplatform/home/api-reference.html#!acpdr/swagger-specs/decisioning-repository.yaml)


### Contributing

Contributions are welcomed! Read the [Contributing Guide](.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
