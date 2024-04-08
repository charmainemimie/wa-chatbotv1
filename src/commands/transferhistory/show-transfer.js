const RedisClient = require("../../utils/redis/redisCient");
const Stages = require("../stages")

class ShowTransferCommand {
    redis = new RedisClient()
    constructor() {}
    execute(message, state, client){
        const { from, messageType, msg, messageId} = message;
        console.log("show transfer")
        const phoneNumber = msg.body;
        this.redis.setValue(`${from.phoneNumber}-phoneNumber`, phoneNumber)
        client.sendText(from.phoneNumber, "Your transfer history is : )", false)
        state.stage = Stages.TRANSFER_HISTORY 
        return state
    }
}

module.exports = ShowTransferCommand