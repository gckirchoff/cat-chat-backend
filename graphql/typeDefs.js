const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar Upload
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    imageUrl: String!
    userName: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    userName: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    userName: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    userName: String!
    createdAt: String!
  }
  type File {
    url: String!
  }
  input RegisterInput {
    userName: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(userName: String!, password: String!): User!
    createPost(body: String!, imageUrl: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
    singleUpload(file: Upload!): File!
  }
`;

// input is a different type of type which is given as an input to a resolvers
