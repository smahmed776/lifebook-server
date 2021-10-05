const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    reacts: {
        unread: [
            {
                react_type: String,
                message: String,
                buddy_id: [],
                post_id: String,
                time: String,
            }
        ],
        read: [
            {
                react_type: String,
                message: String,
                buddy_id: [],
                post_id: String,
                time: String,
            }
        ]
    },

})

const notification = mongoose.model("notification", notificationSchema)

module.exports = notification;