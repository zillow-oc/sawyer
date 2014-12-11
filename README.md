Sawyer
======

##Define Sys Logs

```
require('sawyer')({
  syslog:{
    host: 'mydnshere',
    port: '1234',
    protocol: 'udp4',
    app_name: 'ZNPM',
    json: true
  }
});
```