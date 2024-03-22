const  Stages  = require('./stages');

class ShowMenuCommand {
    constructor() {}

    execute(message, state, client){
        const { from, messageType, msg, messageId} = message;
        client.sendListMessage(from.phoneNumber,"Welcome to NoQ Cash","Please select an option to proceed","NoQ Cash",
        [
            {
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
                        "description": " Withdraw money sent to you"
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
            }] )
        state.stage = Stages.MENU
        return state
    }
}

module.exports =  ShowMenuCommand