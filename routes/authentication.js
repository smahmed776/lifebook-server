require('dotenv').config()
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userProfile = require('../schemas/userProfile');
const notification = require('../schemas/notification');
const  JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;
const JWT_EXPIRE_NUM = process.env.JWT_EXPIRE_NUM;


const jwtToken = (id) => {

    return jwt.sign({id}, JWT_SECRET)
}

const sendToken = (user, statusCode, req, res) => {
    const token = jwtToken(user._id);
    const options = {
        secure: true,
        httpOnly: false,
        sameSite: "none"
    };

    res.cookie('jwt', token, options);

 
    res.status(statusCode).json({
        status: "success",
        token, 
        user
    })
}

const encryptPw = async (password) => {
    return bcrypt.hash(password, 12)
}

exports.signup = async (req, res) => {
    try {
        const {email, password, fName, lName, Dob, image} = req.body;
        const pw = await encryptPw(password)
        if(await User.findOne({email})) return res.status(405).json("User already exist.");
        const newUser = await User.create({
            email, password: pw, name: fName + " " + lName, Dob, image
        });
        const user_id = await User.findOne({email: email})
        await userProfile.create({
            name: fName+ " " + lName,
            email,
            profile_img: image,
            Dob,
            user_id: user_id._id,
        })
        await notification.create({
            user_id: user_id._id,
            reacts: {
                unread: [{
                    message: "Welcome to Lifebook!"
                }],
                read: []
            }
        })
        res.status(201).json("Account created Successfully!");
        
    } catch (error) {
        res.status(400).json("Internal server error")
    }
}


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const getUser = await User.findOne({email}).select("+password");
        if(!getUser) return res.status(400).json(`User doesn't exist!`)
        const compare = await bcrypt.compare(password, getUser.password);

        if(compare){
            sendToken(getUser, 200, req, res);
        } else {
            res.status(405).json("Password invalid")
        }
    } catch (error) {

        res.status(400).json({
            error,
            message: "internal server error"
        });
        
    } 
}


exports.logout = async (req, res) => {
    res.cookie("jwt", "expired");
    res.status(201).json("Logged out successfully!")
}