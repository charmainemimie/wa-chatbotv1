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
            const customerPhoneNumber = from.phoneNumber;

            if(messageType==="interactive"){
                client.sendText(from.phoneNumber, "Login failed. Please try again.", false);
                state.stage = Stages.START;
                return state;
            }
            try {
                // Make an API call to log in the customer
                const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/login', {
                    customerPhoneNumber,
                    customerPinCode
                });
                console.log(response.data)
                state.info.token = response.data.token
                client.sendText(from.phoneNumber, response.data.message, false);
                    // Clear the user's stage
                    // Execute the ShowMenuCommand to display the menu
                return new ShowMenuCommand().execute(message, state, client);
                
            } catch (error) {
                
                if(error.response && error.response.status===401){
                    console.log(error.response.data)
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