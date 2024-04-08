//const ErrorCommand = require("../error-handler");
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const  Stages  = require('../stages');

class HandleTransferCommand {
    redis = new RedisClient();
        constructor() {}
    async execute(message, state, client) {
        const { from } = message;
        const transferHistory = this.retrieveTransferHistory(from.phoneNumber);
        client.sendText(from.phoneNumber, `Your transfer history is: ${transferHistory}`);
        client.sendText(from.phoneNumber, "Type Hi to go back to the main menu");
        state.stage = Stages.MENU;
        return state;
    }

    retrieveTransferHistory(phoneNumber) {
        // Logic to retrieve transfer history for the given phone number
        return "Transfer history data";
    }
}

module.exports = HandleTransferCommand;