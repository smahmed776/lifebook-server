const Posts = require('../schemas/posts');
const userProfile = require('../schemas/userProfile')

exports.profile = async (req, res) => {
    const authHeader = req.headers["athorization"];        
    const id = authHeader && authHeader.split(' ')[1];

    if(id == null) return res.status(401).json("profile not found, try again!");
    try {
        const userPosts = await Posts.find({user_id : id})
        const user = await userProfile.find({user_id: id})
        res.status(200).json({
            userPosts,
            user
        });
    } catch (error) {
        console.log(error);
        res.status(400).json(`${error} server error occured`)
    }
}