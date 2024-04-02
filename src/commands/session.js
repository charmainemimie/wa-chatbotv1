const jwt = require('jsonwebtoken');
const RedisClient = require('../utils/redis/redisCient');

function generateAuthToken() {
    const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '2m' });
    RedisClient.setToken(token); // Set token in Redis for login state control
    return token;
}

module.exports = {
    generateAuthToken
}
