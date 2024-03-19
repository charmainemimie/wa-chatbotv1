const  Stages = require('./stages');

class StartCommand {

    constructor() {}
    execute(message, state, client){
        const { from, messageType, msg, messageId} = message;
        client.sendText(from.phoneNumber, `Welcome ${state.username}`, false)
        state.stage = Stages.RETURN
        return state
    }
}

module.exports = StartCommand