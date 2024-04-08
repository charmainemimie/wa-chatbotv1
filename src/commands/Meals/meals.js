const Stages = require('../stages');
const RedisClient = require('../../utils/redis/redisCient'); // Assuming RedisClient is the appropriate Redis client library
const StartCommand = require('../start-command');
const ErrorCommand = require("../error-handler");

class MealCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling meal selection");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis

        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "4444":
                    client.sendText(from.phoneNumber, "Welcome to our meal booking service! Are you vegetarian or non-vegetarian?", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.MEAL_OPTIONS);
                    break;
                // default:
                //     return new ErrorCommand().execute(message, state, client);
            }
        } else if (userStage === Stages.MEAL_OPTIONS) {
            const mealOption = msg.body.toLowerCase();
            if (mealOption === 'vegetarian' || mealOption === 'non-vegetarian') {
                await this.redis.setValue(`${from.phoneNumber}-mealOption`, mealOption);
                client.sendText(from.phoneNumber, `You have selected: ${mealOption}.`, false);
                // You can add additional logic here if needed
            } else {
                client.sendText(from.phoneNumber, "Invalid choice. Please reply with either 'Vegetarian' or 'Non-vegetarian'.", false);
            }
            // After meal selection, you may redirect to main menu or perform other actions
            return new StartCommand().execute(message, state, client);
        } else {
            return new ErrorCommand().execute(message, state, client);
        }

        return state;
    }
}

module.exports = MealCommand;
