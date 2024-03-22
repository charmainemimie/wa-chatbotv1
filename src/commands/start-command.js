const  Stages = require('./stages');
const ShowMenuCommand = require("./show-menu");
class StartCommand {

    constructor() {}
    execute(message, state, client){
        const { from, messageType, msg, messageId} = message;
        client.sendText(from.phoneNumber, `Welcome ${state.username}`, false)
        return new ShowMenuCommand().execute(message, state, client); 

        // state.stage = Stages.RETURN
        // return state
    }
}

module.exports = StartCommand