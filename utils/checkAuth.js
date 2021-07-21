const { AuthenticationError } = require('apollo-server-express');

const jwt = require('jsonwebtoken');

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    // Bearer ...
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('User from checkAuth', user);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token.');
      }
    }
    throw new Error("Authentication token must be of format: 'Bearer [token]'");
  }
  throw new Error('Authorization header must be provided.');
};
