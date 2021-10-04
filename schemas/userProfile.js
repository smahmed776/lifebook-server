const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    Dob: {
        type: String,
    },
    profile_img: {
        type: String,
        required: false
    },
    cover_img: {
        type: String,
        required: false
    },
    study: [
        Primary = {
            type: String,
        },
        intermediate = {
            type: String,
        },
        Collage = {
            type: String,
        },
        University = {
            type: String,
        }
    ],
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male"
    },
    album: [
        type = Object,
    ]
})


const userProfile = mongoose.model("userProfile", userProfileSchema);

module.exports = userProfile;