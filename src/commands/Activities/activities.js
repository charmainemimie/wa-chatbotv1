const Stages = require('../stages');
const RedisClient = require('../../utils/redis/redisCient'); // Assuming RedisClient is the appropriate Redis client library
const StartCommand = require('../start-command');
const ErrorCommand = require("../error-handler");

class ActivitiesCommand {
    constructor() {
        this.redis = new RedisClient();
    }

    async execute(message, state, client) {
        console.log("handling activities selection");
        const { from, messageType, msg } = message;
        let userStage = await this.redis.getValue(`${from.phoneNumber}-stage`); // Retrieve the current stage from Redis

        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "1111": // Assuming the ID for activities selection is 5555
                    client.sendText(from.phoneNumber, "Welcome to our activities selection service! Please select one or more activities from the list: [Activity 1, Activity 2, Activity 3, Activity 4, Activity 5, Activity 6]", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.ACTIVITIES_SELECTION);
                    break;
                // Add more cases if needed
            }
        } else if (userStage === Stages.ACTIVITIES_SELECTION) {
            // Assuming activities are comma-separated in the message body
            const selectedActivities = msg.body.split(',').map(activity => activity.trim());
            // You can add validation logic here if needed
            await this.redis.setValue(`${from.phoneNumber}-selectedActivities`, selectedActivities);
            client.sendText(from.phoneNumber, `You have selected the following activities: ${selectedActivities.join(', ')}.`, false);
            // You can add additional logic here if needed
            // After activities selection, you may redirect to main menu or perform other actions
            return new StartCommand().execute(message, state, client);
        } else {
            return new ErrorCommand().execute(message, state, client);
        }

        return state;
    }
}

module.exports = ActivitiesCommand;
