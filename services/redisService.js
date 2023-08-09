'use strict'

const redis = require('redis');
const logger = require("./loggerService");
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` })
class RedisService {
  constructor() {
    if (!RedisService.instance) {
      RedisService.instance = this.createClient();
    }
    return RedisService.instance;
  }

  createClient() {
    const client = redis.createClient({
        url: process.env.URL||'redis://redis:6379'
    });

    // Check if Redis is connected
    client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    // Handle Redis connection errors
    client.on('error', (err) => {
      logger.error('Error connecting to Redis:', err);
    });

    return client;
  }
}

module.exports = new RedisService();