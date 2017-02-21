var util = require('util');

function formatArgs(args){
  return [util.format.apply(util, Array.prototype.slice.call(args))];
}

function getTimeStamp() {
  var date = new Date();
  return date.toISOString();
}

function getSyslogMsg(msg){

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

function getSyslogLevel(level){
  if (level === 'warn') {
    level = 'warning';
  }

  return level;
}

module.exports = {
  formatArgs: formatArgs,
  getTimeStamp: getTimeStamp,
  getSyslogMsg: getSyslogMsg,
  getSyslogLevel: getSyslogLevel
};
