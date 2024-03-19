require('dotenv').config()

const express = require("express");
const axios = require("axios");
const requestParser = require('./middleware/requestParser');

const app = express();
const WhatsappClient = require("./utils/whatsapp/whatsappClient")
const RedisClient = require("./utils/redis/redisCient");
const  CommandFactory  = require('./commands/factory');
const Stages = require('./commands/stages')
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN,PHONE_NUMBER_ID,WABA_ID, PORT } = process.env;

const client =new WhatsappClient(GRAPH_API_TOKEN, PHONE_NUMBER_ID, WABA_ID, "v18.0")
const redis = new RedisClient()
//const factory = new CommandFactory();
app.post('/webhook', requestParser, async (req, res) => {
    // Now you can access the parsed request object
    const { from, messageType, msg, messageId} = req.parsedRequest;
    console.log(messageType)
    console.log(msg)
  var userData = await redis.getValue(from.phoneNumber);
  if (userData) {
    userData = JSON.parse(userData)
    console.log(userData);
  } else {
    console.log("CAche MISS");
    userData = {
        phoneNumber: from.phoneNumber,
        username: from.username,
        info: {},
        stage: Stages.START,
      }
  }


  // check if the incoming message contains text
  userData = await CommandFactory.createCommand(userData.stage)
                .execute(req.parsedRequest, userData,client);
  
  redis.setValue(from.phoneNumber,JSON.stringify(userData));
  res.sendStatus(200);

  
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
