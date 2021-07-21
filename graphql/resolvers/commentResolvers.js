const {
  AuthenticationError,
  UserInputError,
} = require('apollo-server-express');

const Post = require('../../models/postModel');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { userName } = checkAuth(context);

      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty.',
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          userName,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError('Post not found.');
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { userName } = checkAuth(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );

        if (
          post.comments[commentIndex].userName === userName &&
          commentIndex !== -1
        ) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError('Action ');
        }
      } else {
        throw new UserInputError('Post not found.');
      }
    },
    likePost: async (_, { postId }, context) => {
      const { userName } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.userName === userName)) {
          // Post already liked. Unlike it.
          post.likes = post.likes.filter((like) => like.userName !== userName);
        } else {
          // Not liked. Like post.
          post.likes.push({
            userName,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError('Post not found.');
    },
  },
};
