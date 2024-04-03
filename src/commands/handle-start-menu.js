const ErrorCommand = require("./error-handler");
const ResetPasswordCommand = require("./myaccount/my-account");
const ShowMenuCommand = require("./show-menu");
const  Stages  = require('./stages');
const StartCommand = require("./start-command");
const HandleTransferCommand = require("./transferhistory/handle-transfer");
const HandleWithdrawalCommand = require("./withdrawal/withdraw");
class HandleStartCommand {

    constructor() {}
    execute(message, state, client){
        console.log("testing")
        const { from, messageType, msg, messageId} = message;
        if(messageType==="interactive" && msg.type==="list_reply"){
        switch(msg.list_reply.id){
            case "1234":
               // client.sendText(from.phoneNumber, "Please select one of the options above", false)
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
                    return new HandleTransferCommand().execute(message, state, client);
                    // client.sendText(from.phoneNumber, "Transfer History", false)
                    // state.stage = Stages.TRANSFER_HISTORY;
                    //break;
            case "89108":
                state.stage = Stages.WITHDRAWALS
                return new HandleWithdrawalCommand().execute(message, state, client);
            case "8911":
                return new HandleTransferCommand().execute(message, state, client);

            case "8912":
                return new ResetPasswordCommand().execute(message, state, client);
            case "8900":
                console.log("logging user out")
                message.messageType="text"
                return new StartCommand().execute(message, state, client);
                //     client.sendText(from.phoneNumber, ".", false)
                //     state.stage = Stages.MY_ACCOUNT
                //  break;
                
            default:
                return new ErrorCommand().execute(message, state, client)
        }
        }else{
            //client.sendText(from.phoneNumber, "Please select one of the options above", false)
            return new ShowMenuCommand().execute(message, state, client)
        }
        
        return state;
    }
}

module.exports = HandleStartCommand