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

        if (messageType === "interactive" && msg.type === "list_reply" && msg.list_reply.id === "register") {
            client.sendText(from.phoneNumber, "Enter First Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_FIRST_NAME);
            return state;
        } else if (userStage === Stages.R_FIRST_NAME) {
            const customerFirstName = msg.body;
            state.info.customerFirstName = customerFirstName;
            client.sendText(from.phoneNumber, "Enter Last Name:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_LAST_NAME);
        } else if (userStage === Stages.R_LAST_NAME) {
            const customerLastName = msg.body;
            state.info.customerLastName = customerLastName;
            client.sendText(from.phoneNumber, "Enter Gender (M/F):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_GENDER);
        } else if (userStage === Stages.R_GENDER) {
            const customerGender = msg.body;
            state.info.customerGender = customerGender;
            client.sendText(from.phoneNumber, "Enter Account Type:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ACCOUNT_TYPE);
        } else if (userStage === Stages.R_ACCOUNT_TYPE) {
            const customerAccountType = msg.body;
            state.info.customerAccountType = customerAccountType;
            client.sendText(from.phoneNumber, "Enter ID Number:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ID_NUMBER);
        } else if (userStage === Stages.R_ID_NUMBER) {
            const customerIdNumber = msg.body;
            state.info.customerIdNumber = customerIdNumber;
            client.sendText(from.phoneNumber, "Enter Date of Birth (YYYY-MM-DD):", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_DOB);
        } else if (userStage === Stages.R_DOB) {
            const customerDateofBirth = msg.body;
            state.info.customerDateofBirth = customerDateofBirth;
            client.sendText(from.phoneNumber, "Enter Pin Code:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_PIN_CODE);
        } else if (userStage === Stages.R_PIN_CODE) {
            const customerPinCode = msg.body;
            state.info.customerPinCode = customerPinCode;
            // Make an API call to register customer
            try {
                const response = await axios.post('https://noqapp-api-oitk6.ondigitalocean.app/customer/auth/register', {
                    customerFirstName: state.info.customerFirstName,
                    customerLastName: state.info.customerLastName,
                    customerGender: state.info.customerGender,
                    customerAccountType: state.info.customerAccountType,
                    customerIdNumber: state.info.customerIdNumber,
                    customerDateofBirth: state.info.customerDateofBirth,
                    customerPhoneNumber: from.phoneNumber,
                    customerPinCode: state.info.customerPinCode,
                });
                client.sendText(from.phoneNumber, `${response.data}`, false);
            } catch (error) {
                console.error("Error during registration:", error);
                client.sendText(from.phoneNumber, "Registration failed. Please try again.", false);
            }
            await this.redis.clearValue(`${from.phoneNumber}-stage`); // Reset the user's stage
            return new ShowMenuCommand().execute(message, state, client);
        }
        return state;
    }
}

module.exports = HandleRegisterCommand;
