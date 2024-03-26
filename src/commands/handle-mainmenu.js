const Stages = require('./stages');
const ErrorCommand = require("./error-handler");
const ResetPasswordCommand = require("./myaccount/my-account");
const ShowMenuCommand = require("./show-menu");
const HandleTransferCommand = require("./transferhistory/handle-transfer");
const HandleWithdrawalCommand = require("./withdrawal/withdraw");
const HandleStartCommand = require('./handle-start-menu');

class HandleMenuCommand {
    constructor() {}

    execute(message, state, client) {
        console.log("testing menu");
        const { from, messageType, msg, messageId } = message;

        if (messageType === "interactive" && msg.type === "list_reply") {
            switch (msg.list_reply.id) {
                case "1234": 
                    client.sendListMessage(from.phoneNumber, "Welcome to NoQ Cash", "Please select an option to proceed", "NoQ Cash", [{
                        "title": "Select an Option",
                        "rows": [
                            {
                                "id": "1234",
                                "title": "Send Money",
                                "description": "Send Money to a registered NoQ Cash Account"
                            },
                            {
                                "id": "5678",
                                "title": "Transfer History",
                                "description": "View your NoQ Cash Transfer History"
                            },
                            {
                                "id": "89108",
                                "title": "Withdrawal",
                                "description": "Withdraw money sent to you"
                            },
                            // {
                            //     "id": "8911",
                            //     "title": "Loyalty Points",
                            //     "description": "View Your NoQ Cash Loyalty Points"
                            // },
                            {
                                "id": "8912",
                                "title": "My Account",
                                "description": "View your Account Details"
                            }
                        ]
                    }]);
                    state.stage = Stages.FIRST_MENU;
                    break;
                    case "1234":
                        return new HandleStartCommand().execute(message, state, client);
                case "5678":
                    return new HandleTransferCommand().execute(message, state, client);
                case "89108":
                    state.stage = Stages.WITHDRAWALS;
                    return new HandleWithdrawalCommand().execute(message, state, client);
                case "8911":
                    return new HandleTransferCommand().execute(message, state, client);
                case "8912":
                    return new ResetPasswordCommand().execute(message, state, client);
                default:
                    return new ErrorCommand().execute(message, state, client);
            }
        } else {
            return new ShowMenuCommand().execute(message, state, client);
        }

        return state;
    }
}

module.exports = HandleMenuCommand;
