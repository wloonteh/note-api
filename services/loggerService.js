'use strict'

const winston = require('winston');

class Logger {
  constructor() {
    if (!Logger.instance) {
      Logger.instance = this.createLogger();
    }
    return Logger.instance;
  }

  createLogger() {
    const logger = winston.createLogger({
      format: winston.format.json(),
      defaultMeta: { service: 'server api' }, // Replace with your service name
      transports: [
        new winston.transports.Console()
      ],
    });

    return logger;
  }
}

module.exports = new Logger();
