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
            if (!customerFirstName) {
                client.sendText(from.phoneNumber, "First Name is required. Please enter your First Name:", false);
                return state;
            }
            state.info.customerFirstName = customerFirstName;
            client.sendText(from.phoneNumber, "Enter Last Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_LAST_NAME);
        } else if (userStage === Stages.R_LAST_NAME) {
            const customerLastName = msg.body.trim();
            if (!customerLastName) {
                client.sendText(from.phoneNumber, "Last Name is required. Please enter your Last Name:", false);
                return state;
            }
            state.info.customerLastName = customerLastName;
            client.sendText(from.phoneNumber, "Enter Gender (M/F):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_GENDER);
        } else if (userStage === Stages.R_GENDER) {
            const customerGender = msg.body.trim().toUpperCase(); // Convert to uppercase
            if (!customerGender || (customerGender !== 'M' && customerGender !== 'F')) {
                client.sendText(from.phoneNumber, "Gender is required and must be M or F. Please enter your Gender:", false);
                return state;
            }
            state.info.customerGender = customerGender;
            client.sendText(from.phoneNumber, "Enter ID Number:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ID_NUMBER);
        } else if (userStage === Stages.R_ID_NUMBER) {
            const customerIdNumber = msg.body.trim();
            if (!customerIdNumber) {
                client.sendText(from.phoneNumber, "ID Number is required. Please enter your ID Number:", false);
                return state;
            }
            state.info.customerIdNumber = customerIdNumber;
            client.sendText(from.phoneNumber, "Enter Date of Birth (DD/MM/YYYY):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_DOB);
        } else if (userStage === Stages.R_DOB) {
            const customerDateofBirth = msg.body.trim();
            if (!customerDateofBirth) {
                client.sendText(from.phoneNumber, "Date of Birth is required. Please enter your Date of Birth:", false);
                return state;
            }
            state.info.customerDateofBirth = customerDateofBirth;
            client.sendText(from.phoneNumber, "Enter Phone Number:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.C_PHONE_NUMBER);
        } else if (userStage === Stages.C_PHONE_NUMBER) {
            const customerPhoneNumber = msg.body.trim();
            if (!customerPhoneNumber) {
                client.sendText(from.phoneNumber, "Phone Number is required. Please enter your Phone Number:", false);
                return state;
            }
            state.info.customerPhoneNumber = customerPhoneNumber;
            client.sendText(from.phoneNumber, "Create a PIN Code:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.C_PIN_CODE);
        } else if (userStage === Stages.C_PIN_CODE) {
            const customerPinCode = msg.body.trim();
            if (!customerPinCode) {
                client.sendText(from.phoneNumber, "PIN Code is required. Please create your PIN Code:", false);
                return state;
            }
            state.info.customerPinCode = customerPinCode;
            // Prompt user to confirm details
            const confirmationMessage = `Confirm details:\nFirst Name: ${state.info.customerFirstName}\nLast Name: ${state.info.customerLastName}\nGender: ${state.info.customerGender}\nID Number: ${state.info.customerIdNumber}\nDate of Birth: ${state.info.customerDateofBirth}\nPhone Number: ${state.info.customerPhoneNumber}\nPIN Code: ${state.info.customerPinCode}\n\nReply with 'Yes' to confirm or 'No' to go back to menu.`;
            client.sendText(from.phoneNumber, confirmationMessage, false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION);
        } else if (userStage === Stages.CONFIRMATION) {
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                // Update the database and inform the client
                await this.updateDatabase(state.info);
                client.sendText(from.phoneNumber, "Account created successfully.", false);
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

    async updateDatabase(userInfo) {
        try {
            const response = await axios.post('http://localhost:5001/api/customers/register', {
                firstName: userInfo.customerFirstName,
                lastName: userInfo.customerLastName,
                gender: userInfo.customerGender,
                idNumber: userInfo.customerIdNumber,
                dateOfBirth: userInfo.customerDateofBirth,
                phoneNumber: userInfo.customerPhoneNumber,
                pinCode: userInfo.customerPinCode,
                accountType: userInfo.customerAccountType // Updated to use the variable name as per instructions
            });
            console.log("Account creation response:", response.data);
        } catch (error) {
            console.error("Error creating account:", error);
        }
    }
}

module.exports = HandleRegisterCommand;
