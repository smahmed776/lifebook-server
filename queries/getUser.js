const { GraphQLID, GraphQLString, GraphQLNonNull, GraphQLObjectType } = require("graphql");



exports.userType = new GraphQLObjectType({
    name: 'user',
    discription: 'list of users',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        image: { type: GraphQLString }
    })
})