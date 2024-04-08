//const ErrorCommand = require("../error-handler");
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const  Stages  = require('../stages');

class ProgramCommand {
    redis = new RedisClient();
        constructor() {}
    async execute(message, state, client) {
        const { from } = message;
        const program = this.retrieveprogram(from.phoneNumber);
        client.sendText(from.phoneNumber, `Your Program: ${program}`);
        client.sendText(from.phoneNumber, "Type Hi to go back to the main menu");
        state.stage = Stages.START;
        return state;
    }

  
}

module.exports = ProgramCommand;