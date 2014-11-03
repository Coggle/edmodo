## Edmodo API Client
[![npm version](https://badge.fury.io/js/edmodo.svg)](http://badge.fury.io/js/edmodo)

This module simplifies the process of making requests to, and parsing responses
from, the [Edmodo](http://edmodo.com) API. It supports version 1.1 of the API.

### Installation
```sh
npm install --save edmodo
```

### Basic Use
Using EdmodoAPI with [Express](http://expressjs.com/) to handle the install API
request:

```js
var edmodo = new EdmodoAPI({
   api_key: process.env.EDMODO_API_KEY,
  api_host: process.env.EDMODO_HOST_NAME
});

app.post("/edmodo/install", function(req, res, next){
  // parse the json-encoded-in-multipart-field response from Edmodo:
  edmodo.parsePostRequest(req, function(err, fields){
    if(err)
      throw err;
    if(!fields.install)
      throw (new Error("Required field 'install' missing."));
    
    // make a request to Edmodo using the information provided in the install
    // request to verify that this request is valid:
    edmodo.get({
          endpoint: "/users",
      access_token: fields.install.access_token,
      query_params: {user_tokens: JSON.stringify([fields.install.user_token])}
    }, function(err, response){
      if(err)
        throw err;
      
      // send success response
      return res.send({"status":"success"});
    });
  });
});
```

### Logging Support
To log requests and responses, provide a logger object when constructing the
API client. The logger must implement `debug`, and `warn` methods, which accept
any number of arguments to log: `logger.debug` will be used to log requests and
responses, and `logger.warn` will be used to log request failures that are
retried (persistent API failures will return an error).

This is compatible with using the
[winston](https://github.com/flatiron/winston) logging framework:

```js
var winston = require('winston');

var edmodo = new EdmodoAPI({
   api_key: process.env.EDMODO_API_KEY,
  api_host: process.env.EDMODO_HOST_NAME,
    logger: winston
});
```

### API Documentation

