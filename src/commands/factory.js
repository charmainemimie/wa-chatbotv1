// Import all commands here
//const ChatCommand = require("./chat-command");
const ErrorCommand = require("./error-handler");
const HandleTransferCommand = require("./transferhistory/handle-transfer");
const SetGoalCommand = require("./sendmoney/send-money1");
const HandleStartCommand = require("./handle-start-menu");
const ShowMenuCommand = require("./show-menu");
const StartCommand = require("./start-command");
const HandleSendMoneyCommand = require("./sendmoney/handle_send-money");
const ResetPasswordCommand = require("./myaccount/my-account");
// HandleVisaCardCommand = require("./visa-card/visa_menu");

const Stages = require("./stages");
const HandleWithdrawalCommand = require("./withdrawal/withdraw");
const HandleLoginCommand = require("./auth/login");

class CommandFactory {
  static createCommand(stage) {
    switch (stage) {
      case Stages.START:
        return new StartCommand();
      case Stages.RETURN:
        return new ShowMenuCommand();
      case Stages.FIRST_MENU:
        return new HandleStartCommand();
      case Stages.SEND_MONEY:
        return new HandleSendMoneyCommand();
      case Stages.REGISTERED_USER:
        return new SetGoalCommand();
      case Stages.TRANSFER_HISTORY:
        return new HandleTransferCommand();
      case Stages.MY_ACCOUNT:
        return new ResetPasswordCommand();
        case Stages.WITHDRAWALS:
        return new HandleWithdrawalCommand();
        case Stages.LOGIN:
        return new HandleLoginCommand();
        case Stages.REGISTER:
        return new HandleRegisterCommand();
        // case Stages.VISA_CARD_APPLICATION:
       // return new ();
      //d other cases as necessary for different stages or command triggers
      default:
        console.log("No matching command found for this stage");
        return new ErrorCommand();
    }
  }
}

module.exports = CommandFactory;
