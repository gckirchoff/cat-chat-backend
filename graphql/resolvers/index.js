const postResolvers = require('./postResolvers');
const userResolvers = require('./userResolvers');
const commentResolvers = require('./commentResolvers');

module.exports = {
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
  // Subscription: {
  //   ...postResolvers.Subscription,
  // },
  Upload: {
    ...postResolvers.Upload,
  },
};

// For modifiers, use the name of the type (Post) and any mutation, query, or subscription that returns a Post will go through this Post modifier and apply these modifications.
