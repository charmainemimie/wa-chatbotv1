// const RedisClient = require("../../utils/redis/redisCient");
// const Stages = require("../stages")

// class SendMoneyCommand {
//     redis = new RedisClient()
//     constructor() {}
//     execute(message, state, client){
//         const { from, messageType, msg, messageId} = message;
//         console.log("recipient phone number")
//         const phoneNumber = msg.body;
//         this.redis.setValue(`${from.phoneNumber}-phoneNumber`, phoneNumber)
//         client.sendText(from.phoneNumber, "Money has been sent successfully : )", false)
//         state.stage = Stages.RETURN
//         return state
//     }
// }

// module.exports = SendMoneyCommand