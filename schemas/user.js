const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required."],
        validate: [validator.isEmail, "Email is invalid."]
    },
    password: {
        type: String,
        select: false
    },
    name: {
        type: String,
    },
    Dob: {
        type: String,
    },
    image: {
        type: String,
        required: false,
    },
    clearance: {
        type: String,
        enum: {
            values: ["user", "moderator", "admin"],
            message: "the clearance is invalid"
        },
        default: "user"
    }
})

const User = mongoose.model('User', userSchema);

module.exports= User;