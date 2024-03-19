const ErrorCommand = require("./error-handler");
const ShowMenuCommand = require("./show-menu");
const  Stages  = require('./stages');

class HandleStartCommand {

    constructor() {}
    execute(message, state, client){
        console.log("testing")
        const { from, messageType, msg, messageId} = message;
        if(messageType==="interactive" && msg.type==="list_reply"){
        switch(msg.list_reply.id){
            case "1234":
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
                    state.stage = Stages.SEND_MONEY
                break;
            case "5678":
                client.sendText(from.phoneNumber, ".", false)
                state.stage = Stages.TRANSFER_HISTORY
                break;
            case "8910":
                client.sendText(from.phoneNumber, ".", false)
                state.stage = Stages.VISA_CARD_APPLICATION
                break;

            case "8911":
                    client.sendText(from.phoneNumber, ".", false)
                    state.stage = Stages.LOYALTY_POINTS
                 break;

            case "8912":
                    client.sendText(from.phoneNumber, ".", false)
                    state.stage = Stages.MY_ACCOUNT
                 break;
                
            default:
                return new ErrorCommand().execute(message, state, client)
        }
        }else{
            client.sendText(from.phoneNumber, "Please select one of the options above", false)
            return new ShowMenuCommand().execute(message, state, client)
        }
        
        return state;
    }
}

module.exports = HandleStartCommand