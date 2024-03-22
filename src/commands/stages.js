// added typed stages to avoid spelling errors when typing stage names across different place
// just add them here and then use Stages(dot)StageName e.g Stages.START
const Stages = {
    START: 'START',
    RETURN: 'RETURN',
    MENU: 'MENU',
    SEND_MONEY: ' SEND_MONEY',
    REGISTERED_USER: 'REGISTERED_USER',
    UNREGISTERED_USER: 'UNREGISTERED_USER',
    R_PHONE_NUMBER: 'R_PHONE_NUMBER',
    TRANSFER_HISTORY: 'TRANSFER_HISTORY',
    R_AMOUNT: ' R_AMOUNT',
    Handle_Send_Money: ' Handle_Send_Money',
    // VISA_CARD_APPLICATION: 'VISA_CARD_APPLICATION',
   WITHDRAWALS: 'WITHDRAWALS',
    MY_ACCOUNT: 'MY_ACCOUNT',
    R_AGENT_NUMBER: 'R_AGENT_NUMBER',
    AMOUNT: 'AMOUNT',
    CONFIRMATION: 'CONFIRMATION',
    AGENT_CODE: 'AGENT_CODE'
 
}

module.exports = Stages;