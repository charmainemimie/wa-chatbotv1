const ErrorCommand = require("../error-handler");
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const  Stages  = require('../stages');

class HandleSendMoneyCommand {
    redis = new RedisClient()
    constructor() {}
    async execute(message, state, client){
        console.log("handling send money")
        const { from, messageType, msg, messageId} = message;
        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "1234":
                    // Prompt for recipient's phone number
                    client.sendText(from.phoneNumber, "Enter Recipient Phone Number:", false);
                    await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_PHONE_NUMBER);
                    break;
                case "5678":
                    client.sendText(from.phoneNumber, "Advice recipient to visit nearest agent to register", false);
                    state.stage = Stages.UNREGISTERED_USER;
                    break;
                case "8910":
                    return new ShowMenuCommand().execute(message, state, client);
                default:
                    return new ErrorCommand().execute(message, state, client);
            }
        } else if (userStage === Stages.R_PHONE_NUMBER) {
            // User has entered the recipient's phone number, prompt for amount
            const recipientPhoneNumber = msg.body;
            await this.redis.setValue(`${from.phoneNumber}-recipientPhoneNumber`, recipientPhoneNumber);
            client.sendText(from.phoneNumber, "Enter Amount to Send:", false);
            await this.redis.setValue(`${from.phoneNumber}-stage`, Stages.R_AMOUNT);
        } else if (userStage === Stages.R_AMOUNT) {
            // User has entered the amount, confirm transaction
            const amount = msg.body;
            // Here, you would typically process the transaction...
            client.sendText(from.phoneNumber, "Transaction to   was successful!", false);
            await this.redis.clearValue(`${from.phoneNumber}-stage`); // Reset the user's stage
            // Optionally, clear other temporary data as needed
        }else{
            client.sendText(from.phoneNumber, "Please select one of the options above", false)
            client.sendListMessage(from.phoneNumber,"NoQ Cash","Send Money to your loved one today","NoQ Cash",
                [
                    {
                        "title": "Select an Option",
                        "rows": [
                            {
                                "id": "1234",
                                "title": "Registered User",
                                "description": "Send to Registered User"
                            },
                            {
                                "id": "5678",
                                "title": "Unregistered User",
                                "description": "Advice Recipient To Visit Nearest Agent to Register"
                            },
                            {
                                "id": "8910",
                                "title": "Back",
                                "description": "Back to Menu"
                            }
                        ]
                    }] )
        }
    
        
        return state;
    }
}

module.exports = HandleSendMoneyCommand