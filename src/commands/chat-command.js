const OpenAI = require("openai");
const RedisClient = require("../utils/redis/redisCient");
const  Stages = require('./stages');

class ChatCommand {

    redis = new RedisClient
    openai = new OpenAI()
    constructor() {}

    async execute( message, state, client){
        const { from, messageType, msg, messageId} = message;
        const chatKey = `${from.phoneNumber}-chat`;
        if(messageType=="interactive"){
            await this.redis.clearValue(chatKey); // remove chat from redis
            client.sendText(from.phoneNumber, "Byeeeeeeeee !", false)
            state.stage =Stages.RETURN
            return state
        }

        const systemPrompt = "You are a wellness coach, you have over 25 years of exprience in the field helping people achieve the fitness and mental goals. You help users with actionable and practical advise to achieve their goals."
       
        let chatInfo = await this.redis.getValue(chatKey);
        let chatHistory = chatInfo ? JSON.parse(chatInfo) : [];

        // Append the latest user message to chat history
        chatHistory.push({ "role": "user", "content": msg.body });

        // Create the completion request payload
        const completionPayload = {
            messages: [ {"role": "system", "content": systemPrompt},...chatHistory],
            model: "gpt-3.5-turbo",
        };

        // Get AI response from OpenAI
        const completion = await this.openai.chat.completions.create(completionPayload);
        const aiResponse = completion.choices[0].message.content;

        // Send AI response to the user
        client.sendButtonMessage(from.phoneNumber, aiResponse, [
            {
                "type": "reply",
                "reply": {
                    "id": "123",
                    "title": "End Chat"
                }
            }])

        // Update chat history with AI response and save to Redis
        chatHistory.push({ "role": "assistant", "content": aiResponse });
        await this.redis.setValue(chatKey, JSON.stringify(chatHistory));

        
        return state
    }
}

module.exports = ChatCommand