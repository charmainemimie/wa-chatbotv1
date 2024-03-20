// Import all commands here
//const ChatCommand = require("./chat-command");
const  ErrorCommand  = require("./error-handler");
//const HandleGoalCommand = require("./sendmoney/handle_send-money");
const SetGoalCommand = require("./sendmoney/send-money1");
const HandleStartCommand = require("./handle-start-menu");
const  ShowMenuCommand  = require("./show-menu");
const  StartCommand  = require("./start-command");
const HandleSendMoneyCommand =require("./sendmoney/handle_send-money")
const Stages = require("./stages")




class CommandFactory {
    static createCommand(stage) {
        switch (stage) {
            case Stages.START:
                return new StartCommand();
            case Stages.RETURN:
                return new ShowMenuCommand()
            case Stages.MENU:
                return new HandleStartCommand()
           case Stages.SEND_MONEY:
                return new HandleSendMoneyCommand()
           case Stages.REGISTERED_USER:
                return new SetGoalCommand()
           
            // Add other cases as necessary for different stages or command triggers
            default:
                console.log('No matching command found for this stage');
                return new ErrorCommand()
        }
    }
}




module.exports = CommandFactory;