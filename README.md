Sawyer
======

##Define Sys Logs

```
require('sawyer')({
  syslogEnvs: ['staging', 'production'], // default
  syslog:{
    host: 'mydnshere',
    port: '1234',
    protocol: 'udp4',
    app_name: 'myapp',
    json: true
  }
});
```
