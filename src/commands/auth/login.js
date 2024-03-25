const axios = require('axios');
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');

class HandleLoginCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        const { from, msg } = message;

        // Check if the stage is for entering the PIN code
        if (state.stage === Stages.R_PIN_CODE) {
            // Prompt the user to enter the PIN code
            client.sendText(from.phoneNumber, "Please enter your PIN code:", false);
            // Set the user's stage to 'VERIFYING_PIN'
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.VERIFYING_PIN);
            // Return the current state
            return state;
        }
        if (state.stage === Stages.VERIFYING_PIN) {
            const customerPinCode = msg.body;
            
            try {
                // Make an API call to log in the customer
                const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/login', {
                    customerPhoneNumber: from.phoneNumber,
                    customerPinCode: customerPinCode,
                });

                // Check if login was successful
                if (response.data.success) {
                    // Send success message
                    client.sendText(from.phoneNumber, `Login successful. Welcome back!`, false);
                    // Clear the user's stage
                    await this.redis.clearValue(`${from.phoneNumber}-stage`);
                    // Execute the ShowMenuCommand to display the menu
                    return new ShowMenuCommand().execute(message, state, client);
                } else {
                    // Send prompt to enter PIN code if login was unsuccessful
                    client.sendText(from.phoneNumber, "Login failed. Please try again.", false);
                }
            } catch (error) {
                console.error("Error during login:", error);
                // Send error message if an error occurred during API call
                client.sendText(from.phoneNumber, "An error occurred during login. Please try again later.", false);
            }
        } else {
            // No matching command found for this stage
            client.sendText(from.phoneNumber, "No matching command found for this stage", false);
        }

        // Return the current state if no action was taken
        return state;
    }
}

module.exports = HandleLoginCommand;
