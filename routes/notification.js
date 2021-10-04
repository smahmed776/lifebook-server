const notification = require('../schemas/notification');
const User = require('../schemas/user');

exports.getNotification = async (req, res) => {
    const authHeader = req.headers["athorization"];        
    const user_id = authHeader && authHeader.split(' ')[1];

    if(user_id == null) return res.status(401).json("User not found, try again!");
    try {
        const getuserNotification = await notification.findOne({user_id: user_id});
        res.status(200).json({
            getuserNotification,
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(`${error} server error occured`)
    }
}

exports.readNotification = async (req, res) => {
    const authHeader = req.headers["athorization"];
    const user_id = authHeader && authHeader.split(' ')[1];

    if(user_id == null) return res.status(401).json("Invalid request!")
    try {
        const getNotification = await notification.findOne({user_id: user_id})
        const readNotif = getNotification.reacts.read;
        const unreadNotif = getNotification.reacts.unread;
        let readArr = []
        let unreadArr = []

        if(readNotif.length > 0){
            readArr.push(...readNotif)
        }
        unreadArr.push(...unreadNotif)
        for (let index = 0; index < unreadArr.length; index++) {
            const element = unreadArr[index];
            if(readArr.map(i=> i.buddy_id).includes(element.buddy_id) && readArr.map(i=> i.post_id).includes(element.post_id) && element.react_type === 'like'){
                //
            } else {
                readArr.push(
                    element
                )
            }
        }

        await notification.findOneAndUpdate({
            user_id: user_id
        },
        {
            reacts: {
                unread: [],
                read: [
                    ...readArr,
                ]
            }
        },
        {
            new: true
        }
        );
        res.status(200).json("success")
    } catch (error) {
        res.status(400).json("something went wrong")
    }
}