const  httpClient = require("./httpClient");
const messagesApi = require("./messages.api");

class WhatsappClient{

constructor(accessToken, senderPhoneId, wabaID, graphAPIVersion="v18.0"){

    this.accessToken = accessToken;
    this.senderPhoneId = senderPhoneId;
    this.wabaID = wabaID;
    this.graphAPIVersion = graphAPIVersion;

    httpClient.defaults.baseURL = `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneId}`;

    httpClient.interceptors.request.use(config => {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        return config;
    }, error => {
        // Handle request error
        return Promise.reject(error);
    });
}

sendText(to, message, preview_url=false){
    messagesApi.sendMessage(to, message, preview_url)
}

sendButtonMessage = async (
    to, 
    bodyText, 
    buttons // This is an array of button objects
  )=>{
 messagesApi.sendButtonMessage(to, 
    bodyText, 
    buttons // This is an array of button objects
  )
}

sendListMessage(
    to, 
    headerText, 
    bodyText, 
    footerText, 
    sections // This is an array of section objects
  ){

    messagesApi.sendListMessage(
        to, 
        headerText, 
        bodyText, 
        footerText, 
        sections // This is an array of section objects
      )
}

sendMedia(to, type, link){
    messagesApi.sendMediaMessage(to,type,link);
}

sendLocation(to, location){
    messagesApi.sendLocationMessage(to,location);
}

sendContact(to, contacts){
    messagesApi.sendContactMessage(to, contacts)
}

sendReactionMessage(to, messageId, emoji){
    messagesApi.sendReactionMessage(to, messageId, emoji);
}

verifyWebhook(mode, token, verifyToken){
    return mode === 'subscribe' && token === verifyToken;
}

parseMessage(){

}

}


module.exports = WhatsappClient;