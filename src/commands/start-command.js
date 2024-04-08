
const Stages = require("./stages");
const  ErrorCommand = require('./error-handler');
const AccommodationCommand = require("./Register/Accommodation/accommodation");
const MealCommand = require("./Meals/meals");
const ActivitiesCommand = require("./Activities/activities");
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
          client.sendText(from.phoneNumber, "Enter Name:", false);
          // Set stage to login
          state.stage = Stages.REGISTER;
       
          // Return only the login command
          return state;
        case "3333":
          // Set stage to register
          state.stage = Stages.ACCOMO;
          return new AccommodationCommand().execute(message, state, client);
        case "4444":
          state.stage = Stages.MEAL_OPTIONS;
          return new MealCommand().execute(message, state, client);
        case "1111":
          state.stage = Stages.ACTIVITIES_SELECTION;
          return new ActivitiesCommand().execute(message, state, client);
       
        default:
          return new ErrorCommand().execute(message, state, client);
      }
    }

    // Send the menu only if it's not an interactive message or after login
    client.sendListMessage(
      from.phoneNumber, "Bookify", "Please select an option to proceed", "Booking made simple, memories made unforgettable",
      [
        {
          title: "Select an Option",
          rows: [
            {
              id: "2222",
              title: "Register",
              description: "Click to register",
            },
            {
              id: "1111",
              title: "Activities",
              description: "Choose Your Activities",
            },
            {
              id: "3333",
              title: "Accommodation",
              description: "Choose your accommodation",
            },
            {
              id: "4444",
              title: "Meal Plan",
              description: "Select your meal plan",
            },
            {
              id: "5555",
              title: "Program",
              description: "Preview the Program",
            },
            {
              id: "6666",
              title: "Payment",
              description: "Make payment",
            },
          ],
        },
      ]
    );

    return state;
  }
}

module.exports = StartCommand;
