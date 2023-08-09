const redis = require('redis');
const logger = require("./loggerService");
class RedisService {
  constructor() {
    if (!RedisService.instance) {
      this.client = this.createClient();
    }
    return RedisService.instance;
  }

  connect(){
    return this.client.connect()
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

  // Method to set a key-value pair in the cache
  set(key, value, expiryInSeconds) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, expiryInSeconds, value, (err, result) => {
        if (err) {
          reject(err);
        } else {
          logger.info("Set in cache")
          resolve(result === 'OK');
        }
      });
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
        this.client.get(key,(err, result) => {
            if (err) {
            reject(err);
            } else {
              logger.info("Get in cache")
              resolve(result === 'OK');
            }
        });
    });
  }

  // Method to invalidate (delete) a key from the cache
  invalidate(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, result) => {
        if (err) {
          reject(err);
        } else {
          logger.info("invalidated in cache")
          resolve(result === 1); // 1 if the key was found and deleted, 0 otherwise
        }
      });
    });
  }

}

module.exports = new RedisService();