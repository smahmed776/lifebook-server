//DOTENV
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 5000;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const JWT_SECRET = process.env.JWT_SECRET;
const { graphqlHTTP } = require('express-graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLSchema } = require('graphql');

//import schemas
const User = require("./schemas/user");
const Posts = require('./schemas/posts')

//import routes
const { updateUser } = require('./routes/updateUser');
const { signup, login, logout } = require('./routes/authentication');
const { newPost, getPost } = require('./routes/userpost');
const { profile } = require('./routes/profile');
const { getNotification, readNotification } = require('./routes/notification');
const { likePost, unlikePost, getReacts, makeComment, deletePost } = require('./routes/postReact');
const notification = require('./schemas/notification');
const { notificationType } = require('./queries/getNotification');
const { userType } = require('./queries/getUser');



//db
const DB = process.env.DATABASE;
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("connected to mongo database");
}







app.use(cors({
    origin: process.env.R_URL,
    credentials: true,
}))


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


app.use(express.json());

app.use(cookieParser())



//Graphql root configuration

const root = new GraphQLObjectType({
    name: "Query",
    discription: "this is root query",
    fields: () => ({
        getUser: {
            type: new GraphQLList(userType),
            resolve: async () => await User.find()
        },
        getAllNotification: {
            type: new GraphQLList(notificationType),
            resolve: async () => await notification.find()
        },
        getOneNotification: {
            type: notificationType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: async (_, args) => await notification.findOne({user_id: args.id})
        }
    })
})

const mySchema = new GraphQLSchema({
    query: root,

})


app.use('/api/v1/auth/graphql', graphqlHTTP(
    {
        schema: mySchema,
        graphiql: true,
    }
),
)


//this is to host both front-end and back-end on same server

// Accessing the path module
// const path = require("path");

// Step 1:
// if(process.env.NODE_ENV == 'production'){
//     app.use(express.static(path.resolve(__dirname, "./Front-end/build")));
// }
// Step 2:
// app.get("*", function (request, response) {
//   response.sendFile(path.resolve(__dirname, "./Front-end/build", "index.html"));
// });





// Routes

//Authorization

const authorizeUser = (req, res, next) => {
    const authHeader = req.headers["athorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json("authorization failed, try login again!");
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json("invalid token!");
        req.user = user;
        next();
    })

}

app.get("/api/v1/auth/user", authorizeUser, async (req, res) => {
    const id = req.user.id
    const user = await User.findById(id);
    const getPosts = await Posts.find({ clearance: "public" }).exec();
    res.status(201).json({
        user,
        getPosts
    })
})

// Authentication

app.post("/api/v1/auth/signup", signup)

app.post("/api/v1/auth/login", login)

app.delete("/api/v1/auth/logout", logout)

// new post 

app.post("/api/v1/auth/newpost", newPost)

// get post 

app.get("/api/v1/auth/post", getPost)


// get user profile 
app.get("/api/v1/auth/profile", profile);

app.put("/api/v1/auth/updateuserprofile", updateUser);

app.put("/api/v1/auth/likepost", likePost)
app.put("/api/v1/auth/unlikepost", unlikePost);


const getReactssmiddle = async (req, res, next) => {
    const authHeader = req.headers["athorization"];
    const postid = authHeader && authHeader.split(' ')[1];
    const contentType = authHeader && authHeader.split(' ')[2]

    if (postid == null) return res.status(401).json("Post not found, try again!");
    if (contentType === "like") {
        try {
            const getPost = await Posts.findById(postid);
            const getLikersId = await getPost.reactions.likes.liker;
            const Arr = getLikersId;
            let likedUser = [];
            await Arr.map(i => (likedUser = [
                ...likedUser, { id: i }
            ]))
            res.locals.likedUser = likedUser;
            res.locals.contentType = contentType;
            next()
        } catch (error) {
            res.status(400).json("something went wrong")
        }
    } else if (contentType === 'comment') {
        try {
            const getPost = await Posts.findById(postid);
            const getLikersId = await getPost.reactions.comments.commentators;
            const Arr = getLikersId;
            let commentUserId = [];
            await Arr.map(i => (commentUserId = [
                ...commentUserId, { id: i.user_id }
            ]))
            res.locals.commentUserId = commentUserId;
            res.locals.commentators = Arr;
            res.locals.contentType = contentType;
            next()
        } catch (error) {
            res.status(400).json("something went wrong")
        }
    } else {
        return res.status(404).json("Bad request")
    }
}

app.get("/api/v1/auth/reacts", getReactssmiddle, getReacts)

app.put("/api/v1/auth/comment", makeComment)

app.delete("/api/v1/auth/deletepost", deletePost)

app.get("/api/v1/auth/notification", getNotification)
app.put("/api/v1/auth/readnotification", readNotification)