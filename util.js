var util = require('util');
var humanize = require('humanize-number');

function formatArgs(args){
  return [util.format.apply(util, Array.prototype.slice.call(args))];
}

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}

function getSyslogMsg(level, msg, meta){
  if (level === 'warn') {
    level = 'warning';
  }

  var msgObj = {
    node_version: process.version,
    title: process.title,
    user: process.env.USER,
    env: process.env.NODE_ENV,
    level: level,
    message: msg,
    meta: meta
  };

  if(process.versions.app){
    msgObj.version = process.versions.app;
  }

  return msgObj;
}

module.exports = {
  formatArgs: formatArgs,
  time: time,
  getSyslogMsg: getSyslogMsg
};
