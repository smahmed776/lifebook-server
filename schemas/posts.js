const mongoose = require('mongoose');

const PostsSchema = new mongoose.Schema({
    user_id: {
    
    },
    name: {
        type: String,
    },
    post: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    user_image: {
        type: String,
    },
    time: {
        type: String,
    },
    reactions: {
        likes: {
            total: 0,
            liker: [],
        },
        comments: {
            buddy_id: [], 
            commentators: []
                
        },
        required: false,
    },
    clearance: {
        type: String,
        enum: {
            values: [
               "public", "friends", "only me"
            ],
        },
        default: "public"
    }

})

const Posts = mongoose.model("Posts", PostsSchema);

module.exports = Posts;