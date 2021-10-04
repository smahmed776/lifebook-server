const User = require('../schemas/user');
const userProfile = require('../schemas/userProfile');
const Posts = require('../schemas/posts')

exports.updateUser = async (req, res) => {
    const {profile_img, cover_img} = req.body;
    const authHeader = req.headers["athorization"];        
    const id = authHeader && authHeader.split(' ')[1];

    if(id == null) return res.status(401).json("profile not found, try again!");
    try {
        if(profile_img){
            const filter = {user_id: id}
            const updateMainUser = {image: profile_img}
            const getUserAlbum = await userProfile.find({user_id: id});
            let arr = [];
            const album = getUserAlbum[0].album
            await arr.push(...album, profile_img)
            const update = {profile_img: profile_img, album: arr}
            await userProfile.findOneAndUpdate(filter, update, {new: true})
            await User.findOneAndUpdate({_id: id}, updateMainUser, {new: true})
            await Posts.updateMany(filter, {user_image: profile_img}, {new: true})
            // await Posts.findByIdAndUpdate(filter, );
            res.status(200).json("Profile Picture changed successfully!");
        } else if (cover_img) {
            const filter = {user_id: id}
            const getUserAlbum = await userProfile.find({user_id: id});
            let arr = [];
            const album = getUserAlbum[0].album
            await arr.push(...album, cover_img)
            const update = {cover_img: cover_img, album: arr}
            await userProfile.findOneAndUpdate(filter, update, {new: true})
        
            res.status(200).json("Cover Picture changed successfully!");
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(`${error} server error occured`)
    }

}