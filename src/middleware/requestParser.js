// src/middleware/requestParser.js
const requestParser = (req, res, next) => {
    try {
        const { entry } = req.body;
        if (entry.length === 0 || !entry[0].changes || entry[0].changes.length === 0) {
            req.parsedRequest = {}
        }

        const change = entry[0].changes[0];
        const { value } = change;
        if (!value.messages || value.messages.length === 0) {
            req.parsedRequest = {}
        }

        const messageDetails = value.messages[0];
        const contactDetails = value.contacts && value.contacts.length > 0 ? value.contacts[0] : {};

        // Constructing the new object with desired information
        const parsedRequest = {
            from: {
                username: contactDetails.profile ? contactDetails.profile.name : 'Unknown',
                phoneNumber: messageDetails.from,
            },
            messageType: messageDetails.type,
            msg: messageDetails[messageDetails.type], // Access the message content by type
            messageId: messageDetails.id
        };

        // Attach the parsed request to the req object for downstream use
        req.parsedRequest = parsedRequest;
        
        next();
    } catch (error) {
       // console.error('Not a message');
       // Not a message callback
        res.status(200);
    }
};

module.exports = requestParser;
