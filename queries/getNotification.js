const { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } = require("graphql");
const notification = require("../schemas/notification")
const User = require("../schemas/user");
const { userType } = require("./getUser");



const readType = new GraphQLObjectType({
    name: 'read',
    fields: () => ({
        react_type: { type: GraphQLString },
        post_id: { type: GraphQLID },
        time: { type: GraphQLString },
        message: { type: GraphQLString },
        buddy_id : { type: GraphQLList(GraphQLString)},
        reacted_user: {
            type: GraphQLList(userType),
            resolve: async (obj) => {
                let arr = []
                for (let index = 0; index < obj.buddy_id.length; index++) {
                    const element = obj.buddy_id[index];
                    
                    arr.push(await User.findOne({_id: element}))
                }
            
                return arr
            }
        }
    })
})




exports.notificationType = new GraphQLObjectType({
    name: 'notification',
    discription: "all notification",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        user_id: { type: GraphQLNonNull(GraphQLID) },
        user: {
            type: userType,
            resolve: async (notificationType) => {
                return await User.findById(notificationType.user_id)
            }
        },
        unread: {
            type: GraphQLList(readType),
            resolve: async (obj) => {
                const notify = await notification.findOne({ user_id: obj.user_id })
                return notify.reacts.unread
            }
        },
        read: {
            type: GraphQLList(readType),
            resolve: async (obj) => {
                const notify = await notification.findOne({ user_id: obj.user_id })
                return notify.reacts.read
            }
        }
    })
})