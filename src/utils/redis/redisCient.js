const { createClient } = require('redis');

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      // Correctly initialize and assign the Redis client to this.client
      this.client = createClient({
        password: 'g3rgPZXdfBSVGPwUHrpbrPLOU4JPySJk',
        socket: {
          host: 'redis-18602.c100.us-east-1-4.ec2.cloud.redislabs.com',
          port: 18602
        }
      }); // you can change this address when deploying to different environments

      // Connect to Redis
      this.client.connect();

      // Event listeners
      this.client.on('connect', () => console.log('Redis Client Connected'));
      this.client.on('error', (err) => {
        console.log(`Error ${err}`);
      });

      RedisClient.instance = this;
    }
    return RedisClient.instance;
  }

  async getValue(key) {
    return await this.client.get(key);
  }

  async setValue(key, value) {
    return await this.client.set(key, value);
  }

  async clearValue(key) {
    return await this.client.del(key);
  }
}

module.exports = RedisClient;
