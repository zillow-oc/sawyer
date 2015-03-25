'use strict';

/****************************
 * Modules
 ****************************/
var winston = require('winston');
var objectAssign = require('object-assign');
var util = require('./util');

/****************************
 * Constants
 ****************************/
var ENV = process.env.NODE_ENV || '';
var DEFAULT_CONFIG = {
	syslogEnvs: ['staging', 'production']
};

// Setup winston
require('winston-syslog').SysLog;
winston.remove(winston.transports.Console);

/****************************
 * Export
 ****************************/
module.exports = function(moduleConfig) {
	console.log('Winston says process.env.NODE_ENV:', ENV);

	var config = objectAssign(DEFAULT_CONFIG, moduleConfig);
	var logger, sysLogger, log;

	// setup default transports
	var transports = [
		new winston.transports.Console({
			handleExceptions: false,
			json: false,
			colorize: true,
			timestamp: true,
			level: 'debug'
		})
	];

	// winston config
	var winstonConfig = {
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
	};

	// setup syslog transport and format the message
	if(config.syslog){
		sysLogger = new winston.transports.Syslog(config.syslog);
		log = sysLogger.log;

		sysLogger.log = function(level, msg, meta, callback){
			var msgObj = util.getSyslogMsg(level, msg, meta);
			log.call(sysLogger, level, "[JSON.LOG]:" + JSON.stringify(msgObj), meta, callback);
		}
	}

	// add syslog transport to logger
	if (sysLogger && config.syslogEnvs.indexOf(ENV) >= 0) {
		transports.push(sysLogger);
	}

	// create new winston logger
	logger = new winston.Logger({
		transports: transports,
		colors: winstonConfig.colors
	});

	// override default console functions
	console.silly = function(){
		logger.silly.apply(logger, util.formatArgs(arguments));
	};
	console.log = function(){
		logger.verbose.apply(logger, util.formatArgs(arguments));
	};
	console.info = function(){
		logger.info.apply(logger, util.formatArgs(arguments));
	};
	console.warn = function(){
		logger.warn.apply(logger, util.formatArgs(arguments));
	};
	console.debug = function(){
		logger.debug.apply(logger, util.formatArgs(arguments));
	};
	console.error = function(){
		logger.error.apply(logger, util.formatArgs(arguments));
	};
};
