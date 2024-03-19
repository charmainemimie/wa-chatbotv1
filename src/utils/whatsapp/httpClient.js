const axios = require('axios');

const httpClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en_US',
        Accept: 'application/json',
        // Additional headers can be added here
    },
});

module.exports = httpClient;
