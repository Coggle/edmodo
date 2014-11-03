/* vim: set ts=2 sw=2 expandtab : */

var request     = require('request');
var Backoff     = require('backoff-retry');
var querystring = require('querystring');
var _           = require('underscore');
var Busboy      = require('busboy');

function nullLog(){
}

function EdmodoAPI(options){
  if(!options.api_key)
    throw new Error("api_key option is required");
  if(!options.api_host)
    throw new Error("api_host option is required");

  this.api_key  = options.api_key;
  this.api_host = options.api_host;
  this.logger   = options.logger || {
    debug: nullLog,
     warn: nullLog,
    error: nullLog,
     info: nullLog
  };
}

EdmodoAPI.prototype.request = function(options, callback){
  var query_params = {
    api_key: this.api_key,
  };

  if(!(options.access_token || options.launch_key)){
    return callback(new Error("Either access token or launch key must be provided."));
  } 
  if(options.access_token){
    query_params.access_token = options.access_token;
  }
  if(options.launch_key){
    query_params.launch_key = options.launch_key;
  }
  query_params = _.extend(query_params, options.query_params || {});
  
  var endpoint = options.endpoint.replace(/^\/*/, "");
  var url = "https://" + this.api_host + "/v1.1/" + endpoint + "?" + querystring.stringify(query_params);

  this.logger.debug("EdmdoAPI:request:", options.method, url);

  request({
       url: url,
    method: options.method
  }, function(err, response, body){
    this.logger.debug("EdmdoAPI:response:", err, response, body);
    if(err) return callback(err);
    callback(null, body);
  });
};

EdmodoAPI.prototype.retriedRequest = function(options, callback){
  var self = this;
  var retry = new Backoff(function(cb){
    self.request(options, cb);
  }, callback, {maxAttemps: 3});
  retry.on('attempt_failed', this.logger.warn);
};

EdmodoAPI.prototype.get = function(options, callback){
  return this.retriedRequest(_.extend(options, {method:'GET'}), callback);
};

EdmodoAPI.prototype.post = function(options, callback){
  return this.retriedRequest(_.extend(options, {method:'POST'}), callback);
};

EdmodoAPI.prototype.parsePostResponse = function(res, callback){
  var busboy = new Busboy({
    headers: req.headers,
     limits: {
      fileSize: 0,
         files: 0
      }
  });
  var error = null;
  var response = {};
  busboy.on('field', function(fieldname, val, name_truncated, val_truncated){
    if(name_truncated){
      error = new Error("fieldname '" + fieldname + "' in request truncated");
      return;
    }
    if(val_truncated){
      error = new Error("fieldname '" + fieldname + "' value in request truncated");
      return;
    }
    try{
      response[fieldname] = JSON.parse(val);
    }catch(e){
      // report only the first error
      if(!error)
        error = e;
    }
  });
  busboy.on('error', function(err){
    callback(err, null);
  });
  busboy.on('finish', function(){
    callback(error, response);
  });
  req.pipe(busboy);
};


module.exports = {
    EdmodoAPI: EdmodoAPI
};


