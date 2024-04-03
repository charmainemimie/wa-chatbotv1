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
            return state;
        } else if (userStage === Stages.R_FIRST_NAME) {
            const customerFirstName = msg.body.trim(); // Remove extra spaces
            state.info.customerFirstName = customerFirstName;
            client.sendText(from.phoneNumber, "Enter Last Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_LAST_NAME);
        } else if (userStage === Stages.R_LAST_NAME) {
            const customerLastName = msg.body.trim();
            state.info.customerLastName = customerLastName;
            client.sendText(from.phoneNumber, "Enter Gender (M/F):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_GENDER);
        } else if (userStage === Stages.R_GENDER) {
            const customerGender = msg.body.trim().toUpperCase(); // Convert to uppercase
            if (customerGender === 'M' || customerGender === 'F') {
                state.info.customerGender = customerGender;
                client.sendText(from.phoneNumber, "Enter Phone Number:", false);
                await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.C_PHONE_NUMBER);
            } 
        } else if (userStage === Stages.C_PHONE_NUMBER) {
            const phoneNumber = msg.body.trim();
            state.info.phoneNumber = phoneNumber;
            // Prompt user to confirm details
            const confirmationMessage = `Confirm details:\nFirst Name: ${state.info.customerFirstName}\nLast Name: ${state.info.customerLastName}\nGender: ${state.info.customerGender}\nPhone Number: ${state.info.phoneNumber}\n\nReply with 'Yes' to confirm or 'No' to go back to menu.`;
            client.sendText(from.phoneNumber, confirmationMessage, false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION);
        } else if (userStage === Stages.CONFIRMATION) {
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                // Check if user exists in the database
                const userExists = await this.checkIfUserExists(state.info);
                if (userExists) {
                    client.sendText(from.phoneNumber, "Account already exists.", false);
                } else {
                    // Update the database and inform the client
                    await this.updateDatabase(state.info);
                    client.sendText(from.phoneNumber, "Account created successfully.", false);
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
        } else {
            // Handle unknown stage or any other unexpected scenario
            console.error("Unknown stage or unexpected scenario:", userStage);
            client.sendText(from.phoneNumber, "Unimplemented", false);
            state.stage = Stages.START;
        }
        return state;
    }

    async checkIfUserExists(userInfo) {
        try {
            const response = await axios.post('http://localhost:5001/api/customers/register', {
                phoneNumber: userInfo.phoneNumber // Checking user existence by phone number
            });
            return response.data.exists;
        } catch (error) {
            console.error("Error checking user existence:", error);
            return false; // Returning false in case of error
        }
    }

    async updateDatabase(userInfo) {
        try {
            const response = await axios.post('http://localhost:5001/api/customers/register', {
                customerFirstName: userInfo.customerFirstName,
                customerLastName: userInfo.customerLastName,
                customerGender: userInfo.customerGender,
                customerPhoneNumber: userInfo.phoneNumber,
                customerAccountType: 'Default' // Assuming 'Default' as the account type for all new registrations
            });
            console.log("Account creation response:", response.data);
        } catch (error) {
            console.error("Error creating account:", error);
        }
    }
}

module.exports = HandleRegisterCommand;
