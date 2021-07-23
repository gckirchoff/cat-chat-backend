const { AuthenticationError } = require('apollo-server-express');

const Post = require('../../models/postModel');
const checkAuth = require('../../utils/checkAuth');
const { GraphQLUpload } = require('graphql-upload');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const sharp = require('sharp');

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);

        if (post) {
          return post;
        } else {
          throw new Error('Post not found.');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      try {
        const user = checkAuth(context);

        if (body.trim() === '') {
          throw new Error('Post body must not be empty.');
        }

        const newPost = new Post({
          body,
          user: user.id,
          userName: user.userName,
          createdAt: new Date().toISOString(),
        });

        const post = await newPost.save();

        // context.pubsub.publish('NEW_POST', {
        //   newPost: post,
        // });

        return post;
      } catch (err) {
        throw new Error(err);
      }
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.userName === post.userName) {
          await post.delete();
          return 'Post deleted successfully.';
        } else {
          throw new AuthenticationError('Action not allowed.');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    singleUpload: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;
      console.log('Hello');

      const stream = createReadStream();
      const originalPathName = path.join(
        __dirname,
        `../../public/images/${'ree'}.jpg`
      );
      const editedPathName = path.join(
        __dirname,
        `../../public/images/${'aaa'}.jpg`
      );

      const transformer = sharp()
        .withMetadata()
        .toFile(originalPathName, function (err) {
          if (err) console.log(err);
        })
        .on('info', function (err, info) {
          session.send('Image height is ' + info.height);
        });

      const transformerTwo = sharp()
        .resize(100, 500, { fit: 'fill' })
        .withMetadata()
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(editedPathName, function (err) {
          if (err) console.log(err);
        })
        .on('info', function (err, info) {
          session.send('Image height is ' + info.height);
        });

      await stream.pipe(transformer); // .pipe(fs.createWriteStream(editedPathName));
      await stream.pipe(transformerTwo);

      return { url: `http:localhost:3005/images/${filename}` };
    },
  },
  Upload: GraphQLUpload,
  // Subscription: {
  //   newPost: {
  //     subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST'),
  //   },
  // },
};

// const stream = createReadStream(filename);
// const pathName = path.join(__dirname, `/public/images/${filename}`);
// await stream.pipe(fs.createWriteStream(pathName));

// const { AuthenticationError } = require('apollo-server-express');
// const { finished } = require('stream');

// const Post = require('../../models/postModel');
// const checkAuth = require('../../utils/checkAuth');
// const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
// const fs = require('fs');

// module.exports = {
//   Query: {
//     async getPosts() {
//       try {
//         const posts = await Post.find().sort({ createdAt: -1 });
//         return posts;
//       } catch (err) {
//         throw new Error(err);
//       }
//     },
//     async getPost(_, { postId }) {
//       try {
//         const post = await Post.findById(postId);

//         if (post) {
//           return post;
//         } else {
//           throw new Error('Post not found.');
//         }
//       } catch (err) {
//         throw new Error(err);
//       }
//     },
//   },
//   Mutation: {
//     async createPost(_, { body }, context) {
//       try {
//         const user = checkAuth(context);

//         if (body.trim() === '') {
//           throw new Error('Post body must not be empty.');
//         }

//         const newPost = new Post({
//           body,
//           user: user.id,
//           userName: user.userName,
//           createdAt: new Date().toISOString(),
//         });

//         const post = await newPost.save();

//         context.pubsub.publish('NEW_POST', {
//           newPost: post,
//         });

//         return post;
//       } catch (err) {
//         throw new Error(err);
//       }
//     },
//     async deletePost(_, { postId }, context) {
//       const user = checkAuth(context);

//       try {
//         const post = await Post.findById(postId);
//         console.log(user);
//         console.log(user.userName);
//         console.log(post);
//         console.log(post.userName);
//         if (user.userName === post.userName) {
//           await post.delete();
//           return 'Post deleted successfully.';
//         } else {
//           throw new AuthenticationError('Action not allowed.');
//         }
//       } catch (err) {
//         throw new Error(err);
//       }
//     },
//   },
//   Subscription: {
//     newPost: {
//       subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST'),
//     },
//   },
// };
