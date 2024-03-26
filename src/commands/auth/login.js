const axios = require('axios');
const ShowMenuCommand = require("../show-menu");
const StartCommand = require("../start-command");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');

class HandleLoginCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        const { from, msg, messageType } = message;

            const customerPinCode = msg.body;
            const customerPhoneNumber = msg.from;

            if(messageType==="interactive"){
                client.sendText(from.phoneNumber, "Login failed. Please try again.", false);
                state.stage = Stages.START;
                return state;
            }
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
                    // Execute the ShowMenuCommand to display the menu
                    return new ShowMenuCommand().execute(message, state, client);
                } else {
                    // Send prompt to enter PIN code if login was unsuccessful
                    client.sendText(from.phoneNumber, "Login failed. Please try again.", false);
                }
            } catch (error) {
                
                if(error.response && error.response.status===401){
                    client.sendButtonMessage(from.phoneNumber, "Incorrect pin ❌\n\nPlease enter the correct PIN code:",  [
                        {
                            "type": "reply",
                            "reply": {
                                "id": "123",
                                "title": "Cancel"
                            }
                        }])
                }else{

                    state.stage = Stages.START
                    console.error("Error during login:", error);
                    // Send error message if an error occurred during API call
                    client.sendText(from.phoneNumber, "An error occurred during login. Please try again later.", false);
                }
                
            }
       

        // Return the current state if no action was taken
        return state;
    }
}

module.exports = HandleLoginCommand;
