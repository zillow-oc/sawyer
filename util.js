var util = require('util');

function formatArgs(args){
  return [util.format.apply(util, Array.prototype.slice.call(args))];
}

function getTimeStamp() {
  var timeZoneOffset = (new Date().getTimezoneOffset() * 60000);
  var localISO = (new Date(Date.now() - timeZoneOffset)).toISOString().slice(0,-1);
  return localISO;
}

function getSyslogMsg(level, msg, meta){
  if (level === 'warn') {
    level = 'warning';
  }

  var app_ver = process.versions.app || "none";
  var formattedMsg = util.format(
    'node_version: %s, app_version: %s, process_title: %s, user: %s, node_env: %s, message: %s',
    process.version,
    app_ver,
    process.title,
    process.env.USER,
    process.env.NODE_ENV,
    msg
  );

  return formattedMsg;
}

module.exports = {
  formatArgs: formatArgs,
  getTimeStamp: getTimeStamp,
  getSyslogMsg: getSyslogMsg
};
