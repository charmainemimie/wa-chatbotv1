const Stages = require('../../stages');
const RedisClient = require('../../../utils/redis/redisCient'); // Assuming RedisClient is the appropriate Redis client library
const StartCommand = require('../../start-command');
const ErrorCommand = require("../../error-handler");

class AccommodationCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling accommodation booking");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis

        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "3333":
                    client.sendText(from.phoneNumber, "Welcome to our accommodation booking service! Here are the types of accommodation we provide:\n1. Rooms\n2. Shallets\nPlease reply with the number corresponding to your choice.", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.A_DATES);
                    break;
                // default:
                //     return new ErrorCommand().execute(message, state, client);
            }
        } else if (userStage === Stages.A_DATES) {
            const dates = msg.body;
            await this.redis.setValue(`${from.phoneNumber}-dates`, dates);
            client.sendText(from.phoneNumber, "Are you booking a single room or sharing? (Single/Shared)", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.A_ROOM_TYPE);
        } else if (userStage === Stages.A_ROOM_TYPE) {
            const roomType = msg.body.toLowerCase();
            if (roomType === 'single' || roomType === 'shared') {
                await this.redis.setValue(`${from.phoneNumber}-roomType`, roomType);
                client.sendText(from.phoneNumber, "Enter room number:", false);
                await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.A_ROOM_NUMBER);
            } else {
                client.sendText(from.phoneNumber, "Invalid choice. Please reply with either 'Single' or 'Shared'.", false);
            }
        } else if (userStage === Stages.A_ROOM_NUMBER) {
            const roomNumber = msg.body;
            await this.redis.setValue(`${from.phoneNumber}-roomNumber`, roomNumber);
            // Confirm details
            client.sendText(from.phoneNumber, `Confirm Details:\nDates: ${await this.redis.getValue(`${from.phoneNumber}-dates`)}\nRoom Type: ${await this.redis.getValue(`${from.phoneNumber}-roomType`)}\nRoom Number: ${roomNumber}\n\nAre these details correct? (Yes/No)`, false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.A_CONFIRMATION);
        } else if (userStage === Stages.A_CONFIRMATION) {
            const confirmation = msg.body.toLowerCase();
            if (confirmation === 'yes') {
                await this.redis.clearValue(`${from.phoneNumber}-stage`);
                client.sendText(from.phoneNumber, "Accommodation booked successfully!", false);
                
                return new StartCommand().execute(message, state, client);
            } else if (confirmation === 'no') {
                await this.redis.clearValue(`${from.phoneNumber}-stage`);
                client.sendText(from.phoneNumber, "Accommodation booking canceled.", false);
                return new StartCommand().execute(message, state, client);
            } else {
                client.sendText(from.phoneNumber, "Invalid response. Please respond with 'Yes' or 'No'.", false);
            }
        } else {
            return new ErrorCommand().execute(message, state, client);
        }

        return state;
    }
}

module.exports = AccommodationCommand;
