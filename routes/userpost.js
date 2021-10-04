// const User = require('../schemas/user');
const Posts = require('../schemas/posts');
const User = require('../schemas/user');

exports.newPost = async (req, res) => {

    try {        
        const {_id, name, post, image, time, clearance, user_image } = req.body;
        const cratePost = await Posts.create({
            user_id: _id,
            name,
            post,
            image: image,
            time,
            clearance,
            user_image, 
            reactions: {
                likes: {
                    total: 0,
                    liker: []
                },
                comments: {
                    total: 0,
                    commentators: [

                    ]
                }
            }
        });
        res.status(201).json({
            message: "Your post created",
            cratePost
        })
    } catch (error) {
        res.status(401).json(`${error} Please try again!`)
    }
}


exports.getPost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const post_id = authHeader && authHeader.split(' ')[1];

    if(!post_id) return res.status(401).json("post not found")
    try {
        const post = await Posts.findById(post_id)
        const user = await User.findById(post.user_id)
        res.status(200).json({
            post,
            user
        })
    } catch (error) {
        res.status(400).json("Something went wrong!")
    }
}
