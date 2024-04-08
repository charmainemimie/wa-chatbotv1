const RedisClient = require("../../utils/redis/redisCient");
const Stages = require("../stages");
const ShowMenuCommand = require("../show-menu");

class ResetPasswordCommand {
    redis = new RedisClient();
    
    constructor() {}

    async execute(message, state, client) {
        const { from, msg } = message;
        console.log("resetting password");
        
        //const emailAddress = msg.body;
        
        // Uncomment to send the password reset link to the user's email
        // await this.sendPasswordResetLink(emailAddress);

        // Send the text message first
        client.sendText(from.phoneNumber, "PASSWORD RESET LINK SENT TO YOUR EMAIL.", false);
        client.sendText(from.phoneNumber, "Type Hi to go back to the main menu");
        state.stage = Stages.MENU;
        
        return state;
        // Return the result of sending the text message before executing the ShowMenuCommand
        // return new ShowMenuCommand().execute(message, state, client);
        
    }
   

    // Implement the method to send password reset link to the user's email
}

module.exports = ResetPasswordCommand;