const notification = require('../schemas/notification');
const Posts = require('../schemas/posts');
const User = require('../schemas/user');

exports.likePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];
    const { user_id } = req.body;

    if (id == null) return res.status(401).json("Post not found, try again!");
    try {
        const userProfile = await User.findById(user_id)
        const reaction = await Posts.findById(id);
        const poster_id = reaction.user_id;
        const count = reaction.reactions.likes.total + 1;
        const likerID = reaction.reactions.likes.liker
        if (likerID.includes(user_id)) return false;
        const comment = reaction.reactions.comments
        const updatePost = await Posts.findOneAndUpdate({
            _id: id
        },
            {
                reactions: {
                    likes: {
                        total: count,
                        liker: [...likerID, user_id],
                    },
                    comments: comment,
                }
            },
            { new: true })


        if (user_id === poster_id) {
            res.status(200).json({
                updatePost,
            });
        } else {

            //set notification

            const getNotificationObj = await notification.findOne({ user_id: poster_id });
            const getPrevLikers = await getNotificationObj.reacts
            const getPrevLikersUnread = await getNotificationObj.reacts.unread
            const getPrevLikersRead = await getNotificationObj.reacts.read

            // check if User has already this post's notification 

            if (await getPrevLikersUnread.find(i => i.post_id === id && i.react_type === 'like') || await getPrevLikersRead.find(i => i.post_id === id && i.react_type === 'like')) {

                // check if user read notification of this post 
                if (getPrevLikersRead.find(i => i.post_id === id && i.react_type === 'like')) {
                    // get buddy ids 
                    const getBuddyIds = getPrevLikersRead[getPrevLikersRead.findIndex(i => i.post_id === id && i.react_type === 'like')].buddy_id;
                    // check if already liked this post 
                    if (getBuddyIds.includes(user_id)) return res.status(200).json("already like")
                    let removeThisPost = getPrevLikersRead.filter(i => i.post_id !== id)
                    const getThisPost = getPrevLikersRead.filter(i => i.post_id === id)
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'like')
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }

                    const getThisType = getThisPost.filter(i => i.react_type === 'like');
                    const updateThisType = {

                        buddy_id: [
                            ...getBuddyIds,
                            user_id
                        ],
                        post_id: getThisPost[0].post_id,
                        time: new Date(),
                        react_type: getThisType[0].react_type,

                    }
                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...getPrevLikersUnread,
                                    updateThisType
    
                                ],
                                read: [
                                    ...removeThisPost
                                ]
                            }
                        })
                    res.status(200).json({
                        updatePost,
                    });
                } else {
                    const getBuddyIds = getPrevLikersUnread[getPrevLikersUnread.findIndex(i => i.post_id === id && i.react_type === 'like')].buddy_id
                    
                    if (getBuddyIds.includes(user_id)) return res.status(200).json("already like")
                    let removeThisPost = getPrevLikersUnread.filter(i => i.post_id !== id)
                    const getThisPost = getPrevLikersUnread.filter(i => i.post_id === id)
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'like')
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }

                    const getThisType = getThisPost.filter(i => i.react_type === 'like');
                    const updateThisType = {

                        buddy_id: [
                            ...getBuddyIds,
                            user_id
                        ],
                        post_id: getThisPost[0].post_id,
                        time: new Date(),
                        react_type: getThisType[0].react_type,

                    }
                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...removeThisPost,
                                    updateThisType
    
                                ],
                                read: [
                                    ...getPrevLikersRead
                                ]
                            }
                        })
                    res.status(200).json({
                        updatePost,
                    });

                }

            } else {

                // this will run if user receives first notification of this post 

                await notification.findOneAndUpdate({
                    user_id: poster_id
                },
                    {
                        reacts: {
                            getPrevLikers,
                            unread: [
                                ...getPrevLikersUnread,
                                {
                                    buddy_id: [user_id],
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
                    { new: true }
                )
                res.status(200).json({
                    updatePost,
                });
            }
        }
    } catch (error) {

        res.status(400).json(`${error} server error occured`)
    }
}



exports.unlikePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];
    const { user_id } = req.body;

    if (id == null) return res.status(401).json("Post not found, try again!");
    try {
        const reaction = await Posts.findById(id);
        const poster_id = reaction.user_id;
        const count = reaction.reactions.likes.total - 1;
        const likerID = reaction.reactions.likes.liker
        const comment = reaction.reactions.comments
        const removeLikeID = likerID.filter(i => i !== user_id)
        const updatePost = await Posts.findOneAndUpdate({ _id: id },
            {
                reactions: {
                    likes: {
                        total: count,
                        liker: [...removeLikeID],
                    },
                    comments: comment
                }
            },
            { new: true })

        if (user_id === poster_id) return res.status(200).json("user is poster")


        const getNotificationObj = await notification.findOne({ user_id: poster_id });
        const getPrevLikers = await getNotificationObj.reacts
        const getPrevLikersUnread = await getNotificationObj.reacts.unread
        const getPrevLikersRead = await getNotificationObj.reacts.read


        // check if user read the notification or not 
        if (getPrevLikersRead[getPrevLikersRead.findIndex(i => i.post_id === id && i.react_type === 'like')] || getPrevLikersUnread[getPrevLikersUnread.findIndex(i => i.post_id === id && i.react_type === 'like')]) {


            if (await getPrevLikersRead[getPrevLikersRead.findIndex(i => i.post_id === id && i.react_type === 'like')]) {

                const getBuddy_id = getPrevLikersRead[getPrevLikersRead.findIndex(i => i.post_id === id && i.react_type === 'like')].buddy_id


                if (getBuddy_id.includes(user_id)) {
               
                    // filter Previous Read Array 
                    let removeThisPost = getPrevLikersRead.filter(i => i.post_id !== id)
                    const getThisPost = getPrevLikersRead.filter(i => i.post_id === id)
              
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'like')
                  
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }
                    
                    const getThisType = getThisPost.filter(i => i.react_type === 'like')
                   
                    const removeThisId = getThisType[0].buddy_id.filter(i => i !== user_id)
                 
                
                    if (removeThisId.length > 0) {
                        const updateThisType = {
                            react_type: getThisType.react_type,
                            post_id: getThisType.post_id,
                            time: getThisType.time,
                            buddy_id: [
                                ...removeThisId
                            ]
                        }
                      
                        await notification.findOneAndUpdate({
                            user_id: poster_id,
                        },
                            {
                                reacts: {
                                    getPrevLikers,
                                    unread: [
                                        ...getPrevLikersUnread
                                    ],
                                    read: [
                                        ...removeThisPost,
                                        updateThisType
                                    ]
                                }
                            },
                            { new: true }
                        )
                        res.status(200).json({
                            updatePost
                        });
                    } else {
                        
                        await notification.findOneAndUpdate({
                            user_id: poster_id,
                        },
                            {
                                reacts: {
                                    getPrevLikers,
                                    unread: [
                                        ...getPrevLikersUnread
                                    ],
                                    read: [
                                        ...removeThisPost,
                                    ]
                                }
                            },
                            { new: true }
                        )
                        res.status(200).json({
                            updatePost
                        });

                    }

                } else {

                }

            } else {
                console.log('working after else');
                // filter previous unread array 

                const getBuddy_id = getPrevLikersUnread[getPrevLikersUnread.findIndex(i => i.post_id === id && i.react_type === 'like')].buddy_id


                if (getBuddy_id.includes(user_id)) {
                    // filter Previous Read Array 
                    let removeThisPost = getPrevLikersUnread.filter(i => i.post_id !== id)
                    const getThisPost = getPrevLikersUnread.filter(i => i.post_id === id)
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'like')
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }
                    const getThisType = getThisPost.filter(i => i.react_type === 'like')
                    const removeThisId = getThisType[0].buddy_id.filter(i => i !== user_id)
                    if (removeThisId.length > 0) {

                        const updateThisType = {
                            react_type: getThisType[0].react_type,
                            post_id: getThisType[0].post_id,
                            time: getThisType[0].time,
                            buddy_id: [
                                ...removeThisId
                            ]
                        }
                        console.log(updateThisType);
                        await notification.findOneAndUpdate({

                            user_id: poster_id,
                        },
                            {
                                reacts: {
                                    getPrevLikers,
                                    unread: [
                                        ...removeThisPost,
                                        updateThisType
                                    ],
                                    read: [
                                        ...getPrevLikersRead
                                    ]
                                }
                            },
                            { new: true }
                        )
                        res.status(200).json({
                            updatePost
                        });
                    } else {
                        await notification.findOneAndUpdate({

                            user_id: poster_id,
                        },
                            {
                                reacts: {
                                    getPrevLikers,
                                    unread: [
                                        ...removeThisPost,
                                    ],
                                    read: [
                                        ...getPrevLikersRead
                                    ]
                                }
                            },
                            { new: true }
                        )
                        res.status(200).json({
                            updatePost
                        });

                    }
                }

            }
        } else {

        }


    } catch (error) {

        res.status(400).json(`${error} server error occured`)
    }

}


exports.getReacts = async (req, res) => {
    const type = res.locals.contentType;
    if (type === 'like') {
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

    if (post_id == null) return res.status(401).json("Post not found, try again!");

    try {
        const userProfile = await User.findById(user_id)
        const reaction = await Posts.findById(post_id);
        const poster_id = reaction.user_id
        const getBuddyIds = reaction.reactions.comments.buddy_id;
        const commentorID = reaction.reactions.comments.commentators
        const like = reaction.reactions.likes
        if (getBuddyIds.includes(user_id)) {
            const filterBuddyId = getBuddyIds.filter(i => i !== user_id);
            await Posts.findOneAndUpdate({
                _id: post_id
            },
                {
                    reactions: {
                        likes: like,
                        comments: {
                            buddy_id: [
                                ...filterBuddyId, user_id
                            ],
                            commentators: [...commentorID, {
                                comment: comment,
                                user_id: user_id,
                                time: time.toString()
                            }],
                        }
                    }
                },
                { new: true })
        } else {
            await Posts.findOneAndUpdate({
                _id: post_id
            },
                {
                    reactions: {
                        likes: like,
                        comments: {
                            buddy_id: [
                                ...getBuddyIds, user_id
                            ],
                            commentators: [...commentorID, {
                                comment: comment,
                                user_id: user_id,
                                time: time.toString()
                            }],
                        }
                    }
                },
                { new: true })
        }


        if (user_id === poster_id) return res.status(200).json("poster is user");

        const getNotificationObj = await notification.findOne({ user_id: poster_id });
        const getPrevLikers = await getNotificationObj.reacts
        const getPrevLikersUnread = await getNotificationObj.reacts.unread
        const getPrevLikersRead = await getNotificationObj.reacts.read

        // check if this post id is already in user's read or unread array 

        if (getPrevLikersRead.find(i => i.post_id === post_id && i.react_type === 'comment') || getPrevLikersUnread.find(i => i.post_id === post_id && i.react_type === 'comment')) {

            // check if this post notification alrady read by user or not
            if (getPrevLikersRead.find(i => i.post_id === post_id && i.react_type === 'comment')) {
                // if user has already read post notification
                // check if this user is in the array 

                const getBuddy_id = getPrevLikersRead[getPrevLikersRead.findIndex(i => i.post_id === post_id && i.react_type === 'comment')].buddy_id;
                if (getBuddy_id.includes(user_id)) {

                    console.log("this user in read array");
                    //if user commented on this post before

                    //filter read array 

                    let removeThisPost = getPrevLikersRead.filter(i => i.post_id !== post_id)
                    const getThisPost = getPrevLikersRead.filter(i => i.post_id === post_id)

                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'comment')

                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }

                    const filterBuudylist = getBuddy_id.filter(i => i !== user_id);
                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...getPrevLikersUnread,
                                    {
                                        buddy_id: [
                                            ...filterBuudylist, user_id
                                        ],
                                        buddy_name: userProfile.name,
                                        post_id: post_id,
                                        time: new Date(),
                                        react_type: "comment"
                                    }
                                ],
                                read: [
                                    ...removeThisPost,
                                ]
                            }
                        },
                        { new: true }
                    )
                    res.status(200).json("commented");
                } else {
                    // if user new to comment on this post in read array 

                    let removeThisPost = getPrevLikersRead.filter(i => i.post_id !== post_id)
                    const getThisPost = getPrevLikersRead.filter(i => i.post_id === post_id)

                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'comment')

                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }

                    // const filterBuudylist = getBuddy_id.filter(i=> i !== user_id);


                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...getPrevLikersUnread,
                                    {
                                        buddy_id: [
                                            ...getBuddy_id, user_id
                                        ],
                                        buddy_name: userProfile.name,
                                        post_id: post_id,
                                        time: new Date(),
                                        react_type: "comment"
                                    }
                                ],
                                read: [
                                    ...removeThisPost,
                                ]
                            }
                        },
                        { new: true }
                    )
                    res.status(200).json("commented");

                }

            } else {
                console.log('user didnot read notification');
                //if user didn't read notification yer

                // check if this user is unread array 
                const getBuddy_id = getPrevLikersUnread[getPrevLikersUnread.findIndex(i => i.post_id === post_id && i.react_type === 'comment')].buddy_id

                if (getBuddy_id.includes(user_id)) {
                    console.log("user did'nt read notification but user is old");

                    //if user commented on this post before 
                    let removeThisPost = getPrevLikersUnread.filter(i => i.post_id !== post_id);
                    const getThisPost = getPrevLikersUnread.filter(i => i.post_id === post_id);
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'comment')
                    // push other types in unread filtered array 
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }

                    const filterBuddylist = getBuddy_id.filter(i => i !== user_id)
                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...removeThisPost,
                                    {
                                        buddy_id: [...filterBuddylist, user_id],
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
                        { new: true }
                    )
                    res.status(200).json("commented");
                } else {
                    console.log("user didn't read notification but user is new");
                    let removeThisPost = getPrevLikersUnread.filter(i => i.post_id !== post_id);
                    const getThisPost = getPrevLikersUnread.filter(i => i.post_id === post_id);
                    const removeOtherTypes = getThisPost.filter(i => i.react_type !== 'comment')
                    // push other types in unread filtered array 
                    for (let index = 0; index < removeOtherTypes.length; index++) {
                        const element = removeOtherTypes[index];
                        removeThisPost.push(element)
                    }


                    await notification.findOneAndUpdate({
                        user_id: poster_id
                    },
                        {
                            reacts: {
                                getPrevLikers,
                                unread: [
                                    ...removeThisPost,
                                    {
                                        buddy_id: [...getBuddy_id, user_id],
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
                        { new: true }
                    )
                    res.status(200).json("commented");
                    // if user is new to comment on this post 


                }
            }

        } else {
            await notification.findOneAndUpdate({
                user_id: poster_id
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
                { new: true }
            )
            res.status(200).json("commented");
        }


    } catch (error) {
        res.status(400).json({ error, message: "something went wrong" })
    }

}


exports.deletePost = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const id = authHeader && authHeader.split(' ')[1];

    if (id == null) return res.status(401).json("Post not found, try again!");
    try {
        await Posts.findByIdAndDelete(id);
        res.status(200).json('Post deleted successfully!')
    } catch (error) {
        res.status(400).json("something went wrong")
    }
}