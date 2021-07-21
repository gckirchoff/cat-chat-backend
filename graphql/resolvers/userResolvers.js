const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server-express');

const User = require('../../models/userModel');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../utils/validators');

const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
  console.log('Token from generateToken', token);
  return token;
};

module.exports = {
  Mutation: {
    async login(_, { userName, password }) {
      const { errors, valid } = validateLoginInput(userName, password);
      console.log(UserInputError);

      if (!valid) {
        console.log('1');
        throw new UserInputError('Errors', { errors });
      }

      // Check if user exists in database
      const user = await User.findOne({ userName });
      if (!user) {
        console.log('2');
        errors.general = 'User not found.';
        throw new UserInputError('User not found.', { errors });
      }

      // Check if given password and hashed database password match
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('3');
        errors.general = 'Wrong  credentials.';
        throw new UserInputError('Wrong credentials.', { errors });
      }

      // Successful, generate token
      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { userName, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        userName,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Make sure user doesn't already exist
      const user = await User.findOne({ userName });
      if (user) {
        throw new UserInputError('Username is not available.', {
          errors: {
            userName: 'This username is not available.',
          },
        });
      }

      // Hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        userName,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
