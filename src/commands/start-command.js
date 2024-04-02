const HandleLoginCommand = require("./auth/login");
const HandleRegisterCommand = require("./auth/register");
const Stages = require("./stages");
const  ErrorCommand = require('./error-handler')
class StartCommand {
  constructor() {}

  async execute(message, state, client) {
    const { from, messageType, msg, messageId } = message;

    // Send the welcome message only if it's not an interactive message
    if (!(messageType === "interactive" && msg.type === "list_reply")) {
      client.sendText(from.phoneNumber, `Hello ${state.username}`, false);
    }

    // Check if the message is interactive and handle button actions
    if (messageType === "interactive" && msg.type === "list_reply") {
      switch (msg.list_reply.id) {
        case "2222":
          // Set stage to login
          state.stage = Stages.LOGIN;
          client.sendText(from.phoneNumber, "Please enter your PIN code:", false);
          // Return only the login command
          return state;
        case "1111":
          // Set stage to register
          state.stage = Stages.REGISTER
          return new HandleRegisterCommand().execute(message, state, client);
        default:
          return new ErrorCommand().execute(message, state, client);
      }
    }

    // Send the menu only if it's not an interactive message or after login
    client.sendListMessage(
      from.phoneNumber, "NoQ Cash", "Please select an option to proceed", "NoQ Cash",
      [
        {
          title: "Select an Option",
          rows: [
            {
              id: "2222",
              title: "Login",
              description: "If you have an account Login to start transacting",
            },
            {
              id: "1111",
              title: "Register",
              description: "Click to register",
            },
          ],
        },
      ]
    );

    return state;
  }
}

module.exports = StartCommand;
