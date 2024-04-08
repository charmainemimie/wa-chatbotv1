// added typed stages to avoid spelling errors when typing stage names across different place
// just add them here and then use Stages(dot)StageName e.g Stages.START
const Stages = {
    START: 'START',
    RETURN: 'RETURN',
    MENU: 'MENU',
    LOGIN: 'LOGIN',
    REGISTER: 'REGISTER',
    EXIT: 'EXIT',
    R_NAME: 'R_NAME',
    R_SURNAME: 'R_SURNAME',
    R_DOB: 'R_DOB',
    R_ID_NUMBER: 'R_ID_NUMBER',
    R_GENDER: 'R_GENDER',
    R_SPECIAL_CONDITION: 'R_SPECIAL_CONDITION',
    R_EMAIL: 'R_EMAIL',
    CONFIRMATION: 'CONFIRMATION',
    ACCOMO: 'ACCOMO',
    A_DATES: 'A_DATES',
    A_ROOM_TYPE: 'A_ROOM_TYPE',
    A_ROOM_NUMBER: 'A_ROOM_NUMBER',
    A_CONFIRMATION: 'A_CONFIRMATION',
    MEAL_OPTIONS: 'MEAL_OPTIONS',
    ACTIVITIES_SELECTION: 'ACTIVITIES_SELECTION',

}

module.exports = Stages;