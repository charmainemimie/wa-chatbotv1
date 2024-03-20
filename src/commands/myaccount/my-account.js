const RedisClient = require("../../utils/redis/redisCient");
const Stages = require("../stages");

class ResetPasswordCommand {
    redis = new RedisClient();
    
    constructor() {}

    async execute(message, state, client) {
        const { from, msg } = message;
        console.log("resetting password");
        
        // Assuming the user sends their email address for password reset
        const emailAddress = msg.body;
        
        // You can implement the logic here to send a password reset link to the user's email
        // For example:
        await this.sendPasswordResetLink(emailAddress);

        // Placeholder response
        client.sendText(from.phoneNumber, "Password reset link sent to your email.", false);
        
        // Optionally, you can update the state if needed
        state.stage = Stages.MY_ACCOUNT // Assuming PASSWORD_RESET is a stage defined in your stages module
        
        return state;
    }

    // Implement the method to send password reset link to the user's email
    async sendPasswordResetLink(emailAddress) {
        // Generate a unique token for password reset link
        const resetToken = generateUniqueToken();
    
        // Store the reset token temporarily, associating it with the user's email address
        await this.redis.setValue(`reset_token:${resetToken}`, emailAddress);
        
        // Construct the password reset link using the reset token
        const resetLink = `https://yourwebsite.com/reset-password?token=${resetToken}`;
        
        // Send the password reset link to the provided email address
        // You can use your email sending service or library to send the email
        // Example with a hypothetical email sending library:
        // emailService.sendEmail({
        //     to: emailAddress,
        //     subject: "Password Reset Link",
        //     body: `Click the following link to reset your password: ${resetLink}`
        // });
    
        // Placeholder console log to indicate that the reset link has been sent
        console.log(`Password reset link has been sent to ${emailAddress}: ${resetLink}`);
    }
}
    

module.exports = ResetPasswordCommand;
