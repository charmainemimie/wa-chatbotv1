// Updated the HandleWithdrawalCommand to make an API call to withdraw money

const axios = require('axios'); // Import axios to make HTTP requests
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');

class HandleWithdrawalCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling withdrawal");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis
        
        // Check if the user is initiating the withdrawal process
        if (messageType === "interactive" && msg.type === "list_reply" && msg.list_reply.id === "89108") {
            client.sendText(from.phoneNumber, "Enter Agent Code: ", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_AGENT_NUMBER);
            return state;
        } else if (userStage === Stages.R_AGENT_NUMBER) {  // Check the user's current stage and proceed accordingly
            // User has entered the agent code, prompt for amount
            const agentCode = msg.body;
            state.info.agentCode = agentCode;
            client.sendText(from.phoneNumber, "Enter Amount to Withdraw:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.AMOUNT);
        } else if (userStage === Stages.AMOUNT) {
            // User has entered the amount, confirm transaction
            const amount = msg.body;
            state.info.amount = amount;
            client.sendText(from.phoneNumber, `Are you sure you want to withdraw ${amount}? from agent ${state.info.agentCode} (Yes/No)`, false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION); // Set confirmation stage
        } else if (userStage === Stages.CONFIRMATION) {
            // User confirmed the transaction
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                // Make an API call to withdraw money
                try {
                    const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/funds/withdraw', {
                        agentNumber: state.info.agentCode,
                        amount: state.info.amount,
                        customerId: from.phoneNumber // Assuming the phone number is used as customer ID
                    });
                    client.sendText(from.phoneNumber, `Withdrawal of ${state.info.amount} was successful! New Balance: ${response.data.newBalance}`, false);
                } catch (error) {
                    console.error("Error during withdrawal:", error);
                    client.sendText(from.phoneNumber, "Withdrawal failed. Please try again.", false);
                }
                await this.redis.clearValue(`${from.phoneNumber}-stage`); // Reset the user's stage
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

module.exports = HandleWithdrawalCommand;