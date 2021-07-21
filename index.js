const { ApolloServer } = require('apollo-server-express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const { graphqlUploadExpress } = require('graphql-upload');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

dotenv.config({ path: './config.env' });

// pubish subscribe
// const pubsub = new PubSub();

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: ({ req }) => ({ req }),
// });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB CONNECTION SUCCESS'));

const PORT = process.env.PORT || 3005;

// server.listen(port, () => {
//   console.log(`App is running on port ${port}...`);
// });

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    Upload: false,
    context: ({ req }) => ({ req }),
  });
  await server.start();

  const app = express();

  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());
  app.use(express.static('public'));

  server.applyMiddleware({ app });

  await new Promise((r) => app.listen({ port: PORT }, r));
  console.log(PORT);

  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
}

startServer();