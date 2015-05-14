Sawyer
======

##Define Sys Logs

```
var sawyer = require('sawyer')({
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

If for some reason you need to close the socket opened by syslog. (You may need to do this in order for the process to exit.) You can use the returned instance of sawyer to so.

```
// using the instance from above
sawyer.transports.syslog.close();
```

Doing this will make sure the message queue is emptied before closing the socket.
