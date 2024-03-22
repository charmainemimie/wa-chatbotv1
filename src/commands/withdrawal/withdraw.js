// Updated the HandleWithdrawalCommand to prompt for amount after entering agent code

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
        }else if (userStage === Stages.R_AGENT_NUMBER) {  // Check the user's current stage and proceed accordingly
            // User has entered the agent code, prompt for amount
            const agentCode = msg.body;
            // Check if the agent code is valid
            if (agentCode === '0000') {
                state.info.agentCode = agentCode
                client.sendText(from.phoneNumber, "Enter Amount to Send:", false);
                await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.AMOUNT);
              //  return state;
            } else {
                client.sendText(from.phoneNumber, "Invalid agent code.", false);
                await this.redis.clearValue(`${from.phoneNumber}-stage`);
               // return state; // Return state without executing any further commands
            }
        } else if (userStage === Stages.AMOUNT) {
            // User has entered the amount, confirm transaction
            const amount = msg.body;
            // Prompt user for confirmation
            client.sendText(from.phoneNumber, `Are you sure you want to withdraw ${amount}? from ${state.info.agentCode} (Yes/No)`, false);
            state.info.amount = 400.00
          //  await this.redis.setValue(`${from.phoneNumber}-withdrawal-amount`, amount);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION); // Set confirmation stage
           // return state;
        } else if (userStage === Stages.CONFIRMATION) {
            // User confirmed the transaction
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                // Retrieve the amount from Redis before using it
                const amount = state.info.amount

                // const success = await transactionService.withdrawAmount(user.info.agentCode,user.info.amount)
                // Process the transaction
                client.sendText(from.phoneNumber, `Withdrawal of ${amount} was successful!`, false);
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