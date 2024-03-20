const ErrorCommand = require("../error-handler");
const ShowMenuCommand = require("../show-menu");
const RedisClient = require("../../utils/redis/redisCient");
const  Stages  = require('../stages');

class HandleTransferCommand {
    redis = new RedisClient()
    constructor() {}
    async execute(message, state, client){
        console.log("handling transfer command")
        const { from, messageType, msg, messageId} = message;
        
        // Assuming you have a method to retrieve transfer history for the user
        const transferHistory = await this.retrieveTransferHistory(from.phoneNumber);
        
        // Display transfer history message
    client.sendText(from.phoneNumber, `Your transfer history is: ${transferHistory} `)
        // [
        //     {
        //         "title": "Select an Option",
        //         "rows": [
        //             {
        //                 "id": "1234",
        //                 "title": "Registered User",
        //                 "description": "Send to Registered User"
        //             },
        //             {
        //                 "id": "5678",
        //                 "title": "Unregistered User",
        //                 "description": "Advice Recipient To Visit Nearest Agent to Register"
        //             },
        //             {
        //                 "id": "8910",
        //                 "title": "Back",
        //                 "description": "Back to Menu"
        //             }
        //         ]
        //     }] )

        state.stage = Stages.TRANSFER_HISTORY  

    

        return state;
    }

    async retrieveTransferHistory(phoneNumber) {
        // Logic to retrieve transfer history from your database or storage
        // Replace this with your actual implementation
        return "Transfer history will be displayed here...";
    }
}

module.exports = HandleTransferCommand;
