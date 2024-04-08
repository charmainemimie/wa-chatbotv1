// Import all commands here
//const ChatCommand = require("./chat-command");
const ErrorCommand = require("./error-handler");
const StartCommand = require("./start-command");
const HandleRegisterCommand = require("./Register/details");

// HandleVisaCardCommand = require("./visa-card/visa_menu");

const Stages = require("./stages");
const AccommodationCommand = require("./Register/Accommodation/accommodation");
const MealCommand = require("./Meals/meals");
const ActivitiesCommand = require("./Activities/activities");

class CommandFactory {
  static createCommand(stage) {
    switch (stage) {
      case Stages.START:
        return new StartCommand();
      case Stages.REGISTER:
        return new HandleRegisterCommand();

      case Stages.ACCOMO:
        return new AccommodationCommand();
      case Stages.MEAL_OPTIONS:
          return new MealCommand();
      case Stages.ACTIVITIES_SELECTION:
            return new ActivitiesCommand();
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
