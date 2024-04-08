const Stages = require('../stages');
const RedisClient = require('../../utils/redis/redisCient'); // Assuming RedisClient is the appropriate Redis client library
const StartCommand = require('../start-command');
const ErrorCommand = require("../error-handler");
const AccommodationCommand = require('./Accommodation/accommodation');

class HandleRegisterCommand {
    constructor() {
        this.redis = new RedisClient();
    }
    
    async execute(message, state, client) {
        console.log("handling register")
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis
        
        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "2222":
                    client.sendText(from.phoneNumber, "Enter Name:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_NAME);
                    break;
                 
                default:
                        return new ErrorCommand().execute(message, state, client);
            }} 
            else if (userStage === Stages.R_NAME) {
                    const name = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-name`, name);
                    client.sendText(from.phoneNumber, "Enter Surname:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_SURNAME);
                } else if (userStage === Stages.R_SURNAME) {
                    const surname = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-surname`, surname);
                    client.sendText(from.phoneNumber, "Enter Date of Birth (YYYY-MM-DD):", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_DOB);
                } else if (userStage === Stages.R_DOB) {
                    const dob = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-dob`, dob);
                    client.sendText(from.phoneNumber, "Enter ID Number:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_ID_NUMBER);
                } else if (userStage === Stages.R_ID_NUMBER) {
                    const idNumber = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-idNumber`, idNumber);
                    client.sendText(from.phoneNumber, "Enter Gender (Male/Female/Other):", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_GENDER);
                } else if (userStage === Stages.R_GENDER) {
                    const gender = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-gender`, gender);
                    client.sendText(from.phoneNumber, "Enter Special Condition (if any):", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_SPECIAL_CONDITION);
                } else if (userStage === Stages.R_SPECIAL_CONDITION) {
                    const specialCondition = msg.body;
                    await this.redis.setValue(`${from.phoneNumber}-specialCondition`, specialCondition);
                    client.sendText(from.phoneNumber, "Enter Email:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_EMAIL);
                } else if (userStage === Stages.R_EMAIL) {
                    const email = msg.body;
                    client.sendText(from.phoneNumber, `Confirm Details:\nName: ${await this.redis.getValue(`${from.phoneNumber}-name`)}\nSurname: ${await this.redis.getValue(`${from.phoneNumber}-surname`)}\nDate of Birth: ${await this.redis.getValue(`${from.phoneNumber}-dob`)}\nID Number: ${await this.redis.getValue(`${from.phoneNumber}-idNumber`)}\nGender: ${await this.redis.getValue(`${from.phoneNumber}-gender`)}\nSpecial Condition: ${await this.redis.getValue(`${from.phoneNumber}-specialCondition`)}\nEmail: ${email}\n\nAre these details correct? (Yes/No)`, false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.CONFIRMATION);
                } else if (userStage === Stages.CONFIRMATION) {
                    const confirmation = msg.body.toLowerCase();
                    if (confirmation === 'yes') {
                        client.sendText(from.phoneNumber, "Registration successful!", false);
                        await this.redis.clearValue(`${from.phoneNumber}-stage`);
                        return new StartCommand().execute(message, state, client);
                        
                    } else if (confirmation === 'no') {
                        await this.redis.clearValue(`${from.phoneNumber}-stage`);
                        client.sendText(from.phoneNumber, "Registration canceled.", false);
                        return new StartCommand().execute(message, state, client);
                    } else {
                        client.sendText(from.phoneNumber, "Invalid response. Please respond with 'Yes' or 'No'.", false);
                    }
               
                      
                    } 
                
            
            return state;
         }}  
        
    

module.exports = HandleRegisterCommand;
