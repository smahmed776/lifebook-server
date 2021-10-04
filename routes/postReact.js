const notification = require('../schemas/notification');
const Posts = require('../schemas/posts');
const User = require('../schemas/user');

exports.likePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];
    const { user_id } = req.body;

    if(id == null) return res.status(401).json("Post not found, try again!");
    try {
        const userProfile = await User.findById(user_id)
        const reaction = await Posts.findById(id);
        const poster_id = reaction.user_id;
        const count = reaction.reactions.likes.total + 1;
        const likerID = reaction.reactions.likes.liker
        if(likerID.includes(user_id)) return false;
        const comment = reaction.reactions.comments
        const updatePost = await Posts.findOneAndUpdate({
            _id: id
        },
        {reactions: {
            likes: {
                total: count,
                liker: [...likerID, user_id],
            },
            comments: comment,
        }
        },
        {new: true})


        if(user_id === poster_id){            
            res.status(200).json({
                updatePost,
            });
        } else {
            const getNotificationObj = await notification.findOne({user_id: poster_id});
            const getPrevLikers = await getNotificationObj.reacts
            const getPrevLikersUnread = await getNotificationObj.reacts.unread
            const getPrevLikersRead = await getNotificationObj.reacts.read
             await notification.findOneAndUpdate({
                user_id : poster_id
            },
            {
                reacts: {
                    getPrevLikers,
                    unread: [
                        ...getPrevLikersUnread,
                        {
                            buddy_id: user_id,
                            buddy_name: userProfile.name,
                            post_id: id,
                            time: new Date(),
                            react_type: "like"
                        }
                    ],
                    read: [
                        ...getPrevLikersRead,
                    ]
                }
            },
            {new: true}
            )
            res.status(200).json({
                updatePost,
            });
        }
    } catch (error) {
    
        res.status(400).json(`${error} server error occured`)
    }
}

exports.unlikePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];
    const { user_id } = req.body;
    
    if(id == null) return res.status(401).json("Post not found, try again!");
    try {
        const reaction = await Posts.findById(id);
        const count = reaction.reactions.likes.total - 1;
        const likerID = reaction.reactions.likes.liker
        const comment = reaction.reactions.comments
        const removeLikeID = likerID.filter(i=> i !== user_id)
        const updatePost = await Posts.findOneAndUpdate({_id: id},
        {reactions: {
            likes: {
                total: count,
                liker: [...removeLikeID],
            },
            comments: comment
        }
        },
        {new: true})
        res.status(200).json({
            updatePost
        });
    } catch (error) {
       
        res.status(400).json(`${error} server error occured`)
    }

}


exports.getReacts = async (req, res) => {
    const type = res.locals.contentType;
    if(type === 'like') {
        const idList = res.locals.likedUser
        try {
            let user = [] 
            
            for (let index = 0; index < idList.length; index++) {
                const element = idList[index];
                user.push(await User.findById(element.id))
            }
            
            res.status(200).json({
                user
            })
        } catch (error) {
            res.status(400).json("something went wrong")
           
        }
    } else if (type === 'comment') {
        const idList = res.locals.commentUserId;
        const commentators = res.locals.commentators;
        try {           
            let user = [] 
            
            for (let index = 0; index < idList.length; index++) {
                const element = idList[index];
                user.push(await User.findById(element.id))
            }
            res.status(200).json({
                user,
                commentators
            })
        } catch (error) {
            res.status(400).json("something went wrong")
            
        }
    }
}


exports.makeComment = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const post_id = authHeader && authHeader.split(' ')[1];
    const { comment, user_id, time } = req.body;

    if(post_id == null) return res.status(401).json("Post not found, try again!");

    try {
        const userProfile = await User.findById(user_id)
        const reaction = await Posts.findById(post_id);
        const poster_id = reaction.user_id
        const count = reaction.reactions.comments.total + 1;
        const commentorID = reaction.reactions.comments.commentators
        const like = reaction.reactions.likes
        const updatePost = await Posts.findOneAndUpdate({
            _id: post_id
        },
        {reactions: {
            likes: like,
            comments: {
                total: count,
                commentators: [...commentorID, {
                    comment: comment,
                    user_id: user_id,
                    time: time.toString()
                }],
            }
        }
        },
        {new: true})


        if(user_id === poster_id){            
            res.status(200).json({
                updatePost,
            });
        } else {
            const getNotificationObj = await notification.findOne({user_id: poster_id});
            const getPrevLikers = await getNotificationObj.reacts
            const getPrevLikersUnread = await getNotificationObj.reacts.unread
            const getPrevLikersRead = await getNotificationObj.reacts.read
             await notification.findOneAndUpdate({
                user_id : poster_id
            },
            {
                reacts: {
                    getPrevLikers,
                    unread: [
                        ...getPrevLikersUnread,
                        {
                            buddy_id: user_id,
                            buddy_name: userProfile.name,
                            post_id: post_id,
                            time: new Date(),
                            react_type: "comment"
                        }
                    ],
                    read: [
                        ...getPrevLikersRead,
                    ]
                }
            },
            {new: true}
            )
            res.status(200).json({
                updatePost,
            });

        }
        
    } catch (error) {
        
    }

}


exports.deletePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];

    if(id == null) return res.status(401).json("Post not found, try again!");
    try {
        await Posts.findByIdAndDelete(id);
        res.status(200).json('Post deleted successfully!')
    } catch (error) {
        res.status(400).json("something went wrong")
    }
}