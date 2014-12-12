//Logging:
//This logger overrides the console functions and applies the winston log defined here.

'use strict';
var winston = require('winston'),
	util = require('util'),
	humanize = require('humanize-number'),
	config = {}; 

require('winston-syslog').SysLog;

//remove the standard console logger from winston
winston.remove(winston.transports.Console);

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}



function getSyslogMsg(level, msg, meta){
	if(level === 'warn') level = 'warning';
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

module.exports = function(config) {
	var start;
	if(!config) config = {};

	//winston config and setup below
	var wconfig = {
	//custom levels are broken
		levels: {
			silly: 0,
			debug: 2,
			verbose: 3,
			info: 4,
			warn: 5,
			error: 6
		},
		colors: {
			silly: 'magenta',
			debug: 'blue',
			verbose: 'cyan',
			info: 'green',
			warn: 'yellow',
			error: 'red'
		}
	}

	var logger,
			sysLogger;
	if(config.syslog){
		sysLogger = new (winston.transports.Syslog)(config.syslog);
		var theLogger = sysLogger.log;
		sysLogger.log = function(level, msg, meta, callback){
			var log = theLogger;
			var msgObj = getSyslogMsg(level, msg, meta);
			log.call(sysLogger, level, "[JSON.LOG]:" + JSON.stringify(msgObj), meta, callback);
		} 
	}
	// Override the built-in console methods with winston hooks
	console.log('Winston says process.env.NODE_ENV:', process.env.NODE_ENV);
	switch((process.env.NODE_ENV || '').toLowerCase()){
		case 'development':
			var transports = [
				new (winston.transports.Console)( {
					handleExceptions: false,
					json: false,
					colorize: true,
					timestamp: true,
					level: 'debug'
				})
			];
			if(sysLogger) transports.push(sysLogger);
			logger = new (winston.Logger)({
				transports:	transports,
				colors: wconfig.colors
			});
			break;
		case 'production':
			// Don't set up the logger overrides
			var transports = [
				new (winston.transports.Console)( {
					handleExceptions: false,
					json: false,
					colorize: false,
					timestamp: true,
					level: 'silly'
				})
			];
			if(sysLogger) transports.push(sysLogger);
			logger = new (winston.Logger)({
				transports: transports,
				colors: wconfig.colors
			});
			break;
		case 'staging':
			var transports = [
				new (winston.transports.Console)( {
					handleExceptions: false,
					json: false,
					colorize: true,
					timestamp: true,
					level: 'silly'
				}),
			];
			logger = new (winston.Logger)({
				transports: transports,
				colors: wconfig.colors
			});
			break;
		default:
			var transports = [
				new (winston.transports.Console)( {
					handleExceptions: false,
					json: false,
					colorize: true,
					timestamp: true,
					level: 'silly'
				}),
			];
			logger = new (winston.Logger)({
				transports: transports,
				colors: wconfig.colors
			});
		break;
	}

	function formatArgs(args){
		return [util.format.apply(util, Array.prototype.slice.call(args))];
	}

	console.silly = function(){
		logger.silly.apply(logger, formatArgs(arguments));
	};
	console.log = function(){
		logger.verbose.apply(logger, formatArgs(arguments));
	};
	console.info = function(){
		logger.info.apply(logger, formatArgs(arguments));
	};
	console.warn = function(){
		logger.warn.apply(logger, formatArgs(arguments));
	};
	console.debug = function(){
		logger.debug.apply(logger, formatArgs(arguments));
	};
	console.error = function(){
		logger.error.apply(logger, formatArgs(arguments));
	};


	return function * (next) {
		//Request interception
		start = new Date;
		console.info('<-- method:[' + this.method 
			+ '] url:[' + this.url 
			+ '] host:[' + this.host 
			+ '] ip:[' + this.ip + ']');
		
		//Error listener
		try {
			yield next;
		} catch (err) {
			this.status = err.status || 500;
			this.body = err.message;
			console.error('server error', err);
		}
		//Response interception

  	var delta = new Date - start;
  	var resp = '--> method:[' + this.method 
  		+ '] url:[' + this.url 
  		+ '] status:[' +  this.status 
  		+ '] time:[' + time.call(null, start) + ']';
  	if(delta > 5000){
  		console.error(resp);
  	}else if(delta > 1000){
  		console.warn(resp);
  	}else{
			console.info(resp);
  	}
	}
}

