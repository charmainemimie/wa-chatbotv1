const axios = require('axios');
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const Stages = require('../stages');

class HandleRegisterCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling registration");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis

        if (messageType === "interactive" && msg.type === "list_reply" && msg.list_reply.id === "1111") {
            client.sendText(from.phoneNumber, "Enter First Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_FIRST_NAME);
            state.stage = Stages.R_FIRST_NAME; // Update the user state's stage property
            return state;
        } else if (userStage === Stages.R_FIRST_NAME) {
            const customerFirstName = msg.body.trim(); // Remove extra spaces
            state.info.customerFirstName = customerFirstName;
            client.sendText(from.phoneNumber, "Enter Last Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_LAST_NAME);
            state.stage = Stages.R_LAST_NAME; // Update the user state's stage property
        } else if (userStage === Stages.R_LAST_NAME) {
            const customerLastName = msg.body.trim();
            state.info.customerLastName = customerLastName;
            client.sendText(from.phoneNumber, "Enter Gender (M/F):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_GENDER);
            state.stage = Stages.R_GENDER; // Update the user state's stage property
        } else if (userStage === Stages.R_GENDER) {
            const customerGender = msg.body.trim().toUpperCase(); // Convert to uppercase
            if (customerGender === 'M' || customerGender === 'F') {
                state.info.customerGender = customerGender;
                client.sendText(from.phoneNumber, "Enter Account Type:", false);
                await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ACCOUNT_TYPE);
                state.stage = Stages.R_ACCOUNT_TYPE; // Update the user state's stage property
            } else {
                client.sendText(from.phoneNumber, "Invalid input. Please enter 'M' or 'F' for gender:", false);
            }
        } 
        // Add other stages here following the same pattern
        
        else {
            // Handle unknown stage or any other unexpected scenario
            console.error("Unknown stage or unexpected scenario:", userStage);
            client.sendText(from.phoneNumber, "An unexpected error occurred. Please try again.", false);
        }
        return state;
    }
}

module.exports = HandleRegisterCommand;
