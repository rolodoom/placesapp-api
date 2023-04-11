///////////////////////////
// APP MODULES

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

///////////////////////////
// FUNCTIONS

/**
 * Retrieves all user from the database
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {object} - Response object with an array of users
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  // Find all users in the database
  const users = await User.find();

  // Send the response with the array of users
  res.json({
    users,
  });
});

/**
 * Creates a new user using name, email and password
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing newly created user details, with password excluded
 */
const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError('User exists already, please login instead.', 422)
    );
  }

  // Create a new user with the provided data
  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Remove the password field from the response
  newUser.password = undefined;

  // Send the response with the newly created user details
  res.status(201).json({
    user: newUser,
  });
});

/**
 * Log in a user by verifying their email and password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express middleware function
 * @returns {Object} - JSON object containing a message confirming the user has logged in
 */
const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if the user exist && password is correct
  const identifiedUser = await User.findOne({ email }).select('+password');

  if (
    !identifiedUser ||
    !(await identifiedUser.correctPassword(password, identifiedUser.password))
  ) {
    return next(
      new AppError('Invalid credentials, could not log you in.', 401)
    );
  }

  // Remove the password field from the response
  identifiedUser.password = undefined;

  res.json({
    message: 'Logged in!',
    user: identifiedUser,
  });
});

///////////////////////////
// EXPORTS

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.logIn = logIn;
