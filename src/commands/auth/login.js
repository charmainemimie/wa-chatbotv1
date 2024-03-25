const axios = require('axios');
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');

class HandleLoginCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling login");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis

        if (messageType === "interactive" && msg.type === "list_reply" && msg.list_reply.id === "login") {
            client.sendText(from.phoneNumber, "Enter Pin Code:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_PIN_CODE);
            return state;
        } else if (userStage === Stages.R_PIN_CODE) {
            const customerPinCode = msg.body;
            // Make an API call to login customer
            try {
                const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/login', {
                    customerPhoneNumber: from.phoneNumber,
                    customerPinCode: customerPinCode,
                });
                client.sendText(from.phoneNumber, `Login successful. Welcome back!`, false);
            } catch (error) {
                console.error("Error during login:", error);
                client.sendText(from.phoneNumber, "Login failed. Please try again.", false);
            }
            await this.redis.clearValue(`${from.phoneNumber}-stage`); // Reset the user's stage
            return new ShowMenuCommand().execute(message, state, client);
        }
        return state;
    }
}

module.exports = HandleLoginCommand;
