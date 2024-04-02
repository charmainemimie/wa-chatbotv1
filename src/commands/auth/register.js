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
                // Prompt for pin code directly after gender
                client.sendText(from.phoneNumber, "Enter Pin Code:", false);
                await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_PIN_CODE);
            } 
            //  else {
            //     client.sendText(from.phoneNumber, "Invalid input. Please enter 'M' or 'F' for gender:", false);
            // }
        } else if (userStage === Stages.R_PIN_CODE) {
            const pinCode = msg.body.trim();
            state.info.pinCode = pinCode;
            client.sendText(from.phoneNumber, "Enter ID Number:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ID_NUMBER);
        } else if (userStage === Stages.R_ID_NUMBER) {
            const idNumber = msg.body.trim();
            state.info.idNumber = idNumber;
            client.sendText(from.phoneNumber, "Enter Registered By:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_REGISTERED_BY);
        } else if (userStage === Stages.R_REGISTERED_BY) {
            const registeredBy = msg.body.trim();
            state.info.registeredBy = registeredBy;
            // Prompt user to enter date of birth after registered by
            client.sendText(from.phoneNumber, "Enter Date of Birth (YYYY-MM-DD):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_DATE_OF_BIRTH);
        } else if (userStage === Stages.R_DATE_OF_BIRTH) {
            const dateOfBirth = msg.body.trim();
            state.info.dateOfBirth = dateOfBirth;
            client.sendText(from.phoneNumber, "Enter Phone Number:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.C_PHONE_NUMBER);
        } else if (userStage === Stages.C_PHONE_NUMBER) {
            const phoneNumber = msg.body.trim();
            state.info.phoneNumber = phoneNumber;
            // Prompt user to confirm details
            const confirmationMessage = `Confirm details:\nFirst Name: ${state.info.customerFirstName}\nLast Name: ${state.info.customerLastName}\nGender: ${state.info.customerGender}\nPin Code: ${state.info.pinCode}\nID Number: ${state.info.idNumber}\nRegistered By: ${state.info.registeredBy}\nPhone Number: ${state.info.phoneNumber}\nDate of Birth: ${state.info.dateOfBirth}\n\nReply with 'Yes' to confirm or 'No' to go back to menu.`;
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
            const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/register', {
                // Assuming you need the phone number for user existence check
                phoneNumber: userInfo.phoneNumber 
            });
            return response.data.exists;
        } catch (error) {
            console.error("Error checking user existence:", error);
            // Handle error appropriately
            return false; // For simplicity, returning false in case of error
        }
    }

    async updateDatabase(userInfo) {
        try {
            const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/register', {
                firstName: userInfo.customerFirstName,
                lastName: userInfo.customerLastName,
                gender: userInfo.customerGender,
                pinCode: userInfo.pinCode,
                idNumber: userInfo.idNumber,
                registeredBy: userInfo.registeredBy,
                phoneNumber: userInfo.phoneNumber,
                dateOfBirth: userInfo.dateOfBirth,
                addedBy: userInfo.addedBy
            });
            console.log("Account creation response:", response.data);
        } catch (error) {
            console.error("Error creating account:", error);
            // Handle error appropriately
        }
    }
}

module.exports = HandleRegisterCommand;
