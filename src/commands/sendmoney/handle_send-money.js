const ErrorCommand = require("../error-handler");
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');
const axios = require('axios'); // Import axios to make HTTP requests

class HandleSendMoneyCommand {
    redis = new RedisClient()
    constructor() {}
    async execute(message, state, client){
        console.log("handling send money")
        const { from, messageType, msg, messageId} = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis
        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "1234":
                    // Prompt for recipient's phone number
                    client.sendText(from.phoneNumber, "Enter Recipient Phone Number:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_PHONE_NUMBER);
                    break;
                case "5678":
                    client.sendText(from.phoneNumber, "Advice recipient to visit nearest agent to register", false);
                    state.stage = Stages.UNREGISTERED_USER;
                    break;
                case "8910":
                    return new ShowMenuCommand().execute(message, state, client);
                default:
                    return new ErrorCommand().execute(message, state, client);
            }
        } else if (userStage === Stages.R_PHONE_NUMBER) {
            // User has entered the recipient's phone number, prompt for amount
            const recipientPhoneNumber = msg.body;
            await this.redis.setValue(`${from.phoneNumber}-recipientPhoneNumber`, recipientPhoneNumber);
            client.sendText(from.phoneNumber, "Enter Amount to Send:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_AMOUNT);
        } else if (userStage === Stages.R_AMOUNT) {
            // User has entered the amount, confirm transaction
            const amount = msg.body;
            // Prompt user for confirmation
            client.sendText(from.phoneNumber, `Are you sure you want to send ${amount} to the recipient? (Yes/No)`, false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION); // Set confirmation stage
        } else if (userStage === Stages.CONFIRMATION) {
            // User confirmed the transaction
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                // Proceed with the transaction
                // Retrieve the recipient's phone number from Redis before using it
                const recipientPhoneNumber = await this.redis.getValue(`${from.phoneNumber}-recipientPhoneNumber`);
                // Make an API call to send money
                try {
                    const response = await axios.patch('https://noqapp-api-oitk6.ondigitalocean.app/customer/funds/sendmoney', {
                        sendToPhoneNumber: recipientPhoneNumber,
                        amount: msg.body
                    });
                    client.sendText(from.phoneNumber, `Transaction to ${recipientPhoneNumber} was successful!`, false);
                } catch (error) {
                    console.error("Error sending money:", error);
                    client.sendText(from.phoneNumber, "Transaction failed. Please try again.", false);
                }
                await this.redis.clearValue(`${from.phoneNumber}-stage`); // Reset the user's stage
                // Optionally, clear other temporary data as needed
                return new ShowMenuCommand().execute(message, state, client);
            } else if (confirmation === 'no') {
                // Transaction canceled, reset the stage
                await this.redis.clearValue(`${from.phoneNumber}-stage`);
                client.sendText(from.phoneNumber, "Transaction canceled.", false);
                return new ShowMenuCommand().execute(message, state, client);
            } else {
                // Invalid response, prompt again
                client.sendText(from.phoneNumber, "Invalid response. Please respond with 'Yes' or 'No'.", false);
                return state;
            }
        }
        return state;
    }
}

module.exports = HandleSendMoneyCommand