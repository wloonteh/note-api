const redis = require('redis');
const logger = require("./loggerService");
class RedisService {
  constructor() {
    if (!RedisService.instance) {
      RedisService.instance = this.createClient();
    }
    return RedisService.instance;
  }

  createClient() {
    const client = redis.createClient({
        url: 'redis://redis:6379'
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