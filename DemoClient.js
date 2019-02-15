"use strict";
const querystring = require("querystring");
const crypto = require("crypto");
class DemoClient{
    constructor(accountid, config) {
        this.accountid = accountid;
        this.accessKeyID = config.accessKeyID;
        this.accessKeySecret =config.accessKeySecret;
    
        const region = config.region? config.region : "cn-shanghai";
    
        const protocol = config.secure ? config.secure :"https";
        const timeout = config.timeout ? config.timeout : 60000;
        const internal =config.internal ? "-internal" :"";
    
        this.endpoint = `${protocol}://${accountid}.${region}${internal}.fc.aliyuncs.com`;
        this.host = `${accountid}.${region}${internal}.fc.aliyuncs.com`;
        this.version = "2016-08-15";
        this.timeout = Number.isFinite(timeout) ? timeout : 60000; // default is 60s
        this.headers = config.headers || {};
    }

    async request(method, path, query, body, headers = {}, opts = {}) {
        var url = `${this.endpoint}/${this.version}${path}`;
        if (query && Object.keys(query).length > 0) {
          url = `${url}?${querystring.stringify(query)}`;
        }
    
        headers = Object.assign(this.buildHeaders(), this.headers, headers);
        var postBody;
        if (body) {
          debug("request body: %s", body);
          var buff = null;
          if (Buffer.isBuffer(body)) {
            buff = body;
            headers["content-type"] = "application/octet-stream";
          } else if (typeof body === "string") {
            buff = new Buffer(body, "utf8");
            headers["content-type"] = "application/octet-stream";
          } else {
            buff = new Buffer(JSON.stringify(body), "utf8");
            headers["content-type"] = "application/json";
          }
          const digest = kitx.md5(buff, "hex");
          const md5 = new Buffer(digest, "utf8").toString("base64");
          headers["content-length"] = buff.length;
          headers["content-md5"] = md5;
          postBody = buff;
        }
    
        var queriesToSign = null;
        if (path.startsWith("/proxy/")) {
          queriesToSign = query || {};
        }
        var signature = Client.getSignature(
          this.accessKeyID,
          this.accessKeySecret,
          method,
          `/${this.version}${path}`,
          headers,
          queriesToSign
        );
        headers["authorization"] = signature;
    
        debug("request headers: %j", headers);
    
        const response = await httpx.request(url, {
          method,
          timeout: this.timeout,
          headers,
          data: postBody
        });
    
        debug("response status: %s", response.statusCode);
        debug("response headers: %j", response.headers);
        var responseBody;
        if (!opts["rawBuf"] || response.headers["x-fc-error-type"]) {
          responseBody = await httpx.read(response, "utf8");
        } else {
          responseBody = await httpx.read(response);
        }
    
        debug("response body: %s", responseBody);
    
        const contentType = response.headers["content-type"] || "";
        if (contentType.startsWith("application/json")) {
          try {
            responseBody = JSON.parse(responseBody);
          } catch (ex) {
            // TODO: add extra message
            throw ex;
          }
        }
    
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const code = response.statusCode;
          const requestid = response.headers["x-fc-request-id"];
          const err = new Error(
            `${method} ${path} failed with ${code}. requestid: ${requestid}, message: ${
              responseBody.ErrorMessage
            }.`
          );
          err.name = `FC${responseBody.ErrorCode}Error`;
          err.code = responseBody.ErrorCode;
          throw err;
        }
    
        return {
          headers: response.headers,
          data: responseBody
        };
      }
}
module.exports = DemoClient;