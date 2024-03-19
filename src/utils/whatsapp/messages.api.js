const httpClient = require("./httpClient");

// Helper function to post messages
async function postMessage(endpoint, messageData) {
  try {
    const response = await httpClient.post(endpoint, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error; // Re-throwing the error to be handled or logged by the caller
  }
}

// Simplified sendMessage using the helper
const sendMessage = async (to, message, preview_url = false) => {
  const messageData = {
    messaging_product: "whatsapp",
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: preview_url,
      body: message
    }
  };
  return await postMessage('/messages', messageData);
};

// Refactored sendMediaMessage using a mapping approach
const sendMediaMessage = async (to, type, link) => {
  const messageData = {
    messaging_product: "whatsapp",
    recipient_type: 'individual',
    to: to,
    type: type,
    [type]: { link: link }
  };

  return await postMessage('/messages', messageData);
};

const sendLocationMessage = async (to, location) => {
  const messageData = {
    messaging_product: "whatsapp",
    recipient_type: 'individual',
    to: to,
    type: "location",
    location: location
  };

  return await postMessage('/messages', messageData);
};

const sendReactionMessage = async (to, messageId, emoji) => {
  const messageData = {
    messaging_product: "whatsapp",
    recipient_type: 'individual',
    to: to,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji: emoji
    }
  };

  return await postMessage('/messages', messageData);
};

const sendContactMessage = async (to, contacts) => {
  const messageData = {
    messaging_product: "whatsapp",
    recipient_type: 'individual',
    to: to,
    type: "contact",
    contacts: contacts
  };

  return await postMessage('/messages', messageData);
};


const sendListMessage = async (
    to, 
    headerText, 
    bodyText, 
    footerText, 
    sections // This is an array of section objects
  ) => {
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: 'individual',
      to: to,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: headerText
        },
        body: {
          text: bodyText
        },
        footer: {
          text: footerText
        },
        action: {
          button: "Select an Option",
          sections: sections
        }
      }
    };
  
    return await postMessage('/messages', messageData);
  };

  const sendButtonMessage = async (
    to, 
    bodyText, 
    buttons // This is an array of button objects
  ) => {
    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: 'individual',
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText
        },
        action: {
          buttons: buttons
        }
      }
    };
  
    return await postMessage('/messages', messageData);
  };
  
  module.exports = {
    sendMessage,
    sendMediaMessage,
    sendLocationMessage,
    sendReactionMessage,
    sendContactMessage,
    sendButtonMessage,
    sendListMessage
  };
