const  Stages  = require('./stages');

class ErrorCommand {

    constructor() {}

    execute( message, state, client){
        const { from, messageType, msg, messageId} = message;
        client.sendText(from.phoneNumber,"An unexpected error occured", false)
        state = {
            phoneNumber: from.phoneNumber,
            username: from.username,
            info: {},
            stage: Stages.START,
          }
        return state
    }
}

module.exports = ErrorCommand