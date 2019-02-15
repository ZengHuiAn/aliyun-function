const crypto = require("crypto");
// 'use strict';

var FCClient = require('@alicloud/fc2');
const config = {
    region: 'cn-shanghai', // 区
    accessKeyID: 'LTAIwccMruu9qkXd', // id
    accessKeySecret: 'V3xjGJS3QM06qu7bOpxqACvOvxnsBr', // 	Access Key Secret
  };
  
  const triggerConfig = {
    accountid: '1773727390132234',
    region: 'cn-shanghai', // 地区
    internal: '',
    protocol: 'https',
    timeout: 6000,
    version: '2016-08-15',
  };

var client = new FCClient(triggerConfig.accountid, {
    accessKeyID: config.accessKeyID,
    accessKeySecret: config.accessKeySecret,
    region: 'cn-shanghai',
    secure: true, //https
  });

//   https://1773727390132234.cn-shanghai.fc.aliyuncs.com/2016-08-15/proxy/server_log/fc_demo
//   https://1773727390132234.cn-shanghai.fc.aliyuncs.com/2016-08-15/proxy/server_log/fc_demo/
var serviceName = 'server_log';
var funcName = 'fc_demo';
var triggerName = "ht";

// var DemoClient = require("./DemoClient")

// const demo = new DemoClient(triggerConfig.accountid, {
//     accessKeyID: config.accessKeyID,
//     accessKeySecret: config.accessKeySecret,
//     region: 'cn-shanghai',
//     timeout: 60 // Request timeout in milliseconds, default is 10s
//   })

// console.log(DemoClient);
client.getFunction(serviceName,funcName).then(resp=>{
    console.log(resp);
})
//   console.log(client);


