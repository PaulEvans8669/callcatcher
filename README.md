[![npm version](https://badge.fury.io/js/callcatcher.svg)](https://badge.fury.io/js/callcatcher)
[![Package Quality](https://packagequality.com/shield/callcatcher.svg)](https://packagequality.com/#?package=callcatcher)
[![codecov](https://codecov.io/gh/PaulEvans8669/callcatcher/branch/main/graph/badge.svg?token=9drZXADeaY)](https://codecov.io/gh/PaulEvans8669/callcatcher)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/PaulEvans8669/callcatcher.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/PaulEvans8669/callcatcher/context:javascript)
![CallCatcher](callcatcher.png)

# Your native NodeJS monitoring API


CallCatcher is a flyweight typescript API managing request monitoring for NodeJS apps natively. 
Requests and responses saved locally, and redistributed to the developer through [NeDB](https://github.com/louischatriot/nedb).
It is then up to the developer to make use of the distributed data.

# Installation

```shell
$ npm install callcatcher --save
```

# Building

To build the project, run the following command
```shell
$ npm run build
```

Please make sure you lint the project before building it
```shell
$ npm run lint
```
or
```shell
$ npm run lint:fix
```


# Documentation

To generate the documentation use the following command :
```shell
$ npm run doc
```

This will generate a new `docs` folder located at the project's root. The entrypoint to the documentation is the `index.html` file.


# Running tests

To run unit test use the following command :
```shell
$ npm run test
```

This will generate a new `coverage` folder located at the project's root. This folder is used by codecov to calculate the coverage of the tests.

# API

- Methods
    - [Probing](#probing)
    - [Reporting](#reporting)
- Data structures
    - [Report](#report)
    - [Hit](#hit)
- Events
  - Report
    - [onHit](#onHit)
    - [onError](#onError)
  
## Methods

### <a name="probing"></a> Probing

The first step for monitoring your server is probing. When creating a server using any NodeJS compatible library, 
the freshly created [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) can be probed using the [`probe()`](src/lib/probe.ts) method.

Calling the [`probe()`](src/lib/probe.ts) method on a [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) instance,
lets the API know that all ingoing and outgoing http messages should be saved and used later on during reporting.

See [probe](src/lib/probe.ts).

#### Probing example

##### Using Express
```javascript
const monitor = require('callcatcher');
const express = require('express');

const app = express();
app.use(express.json());

// let the express app it has to listen for GET requests on the /icecream route
app.get('/icecream', (req,res) => {
    res.status(200).json(/* data */);
})


// create a new http.Server using Express (or any other framework, or even none...)
const server = app.listen(8080, () => {
    console.log("Listening on port 8080");
});

// Probe the running server
monitor.probe(server);
```


### <a name="reporting"></a> Reporting

The second step of monitoring you NodeJS app using CallCatcher is reporting. After probing your [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server),
the last step is to get the data back. The is where the [`report()`](src/lib/report.ts) method comes in handy.

The [`report()`](src/lib/report.ts) method creates a Report instance, which is nothing more than a superset of a NeDB database instance.
NeDB methods can be used on the outputted data. For more information on how to use NeDB, please refer to the [official NeDB github page](https://github.com/louischatriot/nedb).

See [report](src/lib/report.ts).
#### Reporting example

##### Using Express
```javascript
const monitor = require('callcatcher');

const server = /* init a new http.Server */;

// Probe the running server
monitor.probe(server);

// Create a new route to get the monitoring data back.
app.get('/stats', (req,res) => {
    res.status(200).json(monitor.report(server).getAllData());
})
```

## Data structures

### <a name="report"></a> Report

A [Report](src/models/report.ts) is an extension of a NeDB database containing Hits.

```typescript
export class Report extends Nedb<Hit> {}
```

### <a name="hit"></a> Hit

A [Hit](src/models/hit.ts) is the data structure of a single api call, which contains information on the request and the response.

```typescript
export interface Hit {
  response: {
    status: {
      code: number;
      message: string;
    }
    datetime?: number;
  };
  request: {
    httpVersion: string;
    url?: string;
    method?: string;
    headers: IncomingHttpHeaders;
    body: object;
    datetime: number;
  };
}
```

## Events

### Report

#### <a name="onHit"></a> onHit

When inserting documents (a.k.a. hits to a report), the `hit` event gets fired, containing the inserted documents :

```typescript
// models/report.ts
// line 40
            this.emit('hit', documents);
```

The emitted documents can then be used as such :
```typescript
const server: Server = /* init a new http.Server */;
const rep: Report = await report(server);
// A hit gets added to the report
rep.on('hit', (docs: Hit[]) => {
  console.log(docs);
});
```

#### <a name="onError"></a> onError

Similarly, as the hit event, the error event gets emitted with and error message when an error occurred when adding one or many hits to the report.

```typescript
const server: Server = /* init a new http.Server */;
const rep: Report = await report(server);
// A hit gets added to the report, but an error occurres ...
rep.on('error', (err: Error) => {
  console.err(err);
});
```
