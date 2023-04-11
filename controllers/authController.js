///////////////////////////
// CORE MODULES

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

///////////////////////////
// APP MODULES

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

///////////////////////////
// FUNCTIONS

/**
 * Retrieves token based on User id and JWT_SECRET
 * @param {String} id - User id
 */
const signToken = (id, email) =>
  jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/**
 * Creates a sent token
 * @param {object} user - User to be logged in
 * @param {number} statusCode - Number for the token
 * @param {object} res - Express response object
 * @returns {json} - Response containing newly created user details, with password excluded
 */
const createSentToken = (user, statusCode, res) => {
  const token = signToken(user.id, user.email);

  // // Cookie
  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //Convert to milliseconds
  //   ),
  //   httpOnly: true,
  // };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secuer = true;

  // res.cookie('jwt', token, cookieOptions);

  // // Remove password from output
  // user.password = undefined;
  // user.active = undefined;
  // user.role = undefined;

  res.status(statusCode).json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
};

/**
 * Signs up a new user using name, email and password
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

  // If everything is ok, send token to the client
  // with newly created user details
  createSentToken(newUser, 201, res);

  // // Send the response with the newly created user details
  // res.status(201).json({
  //   user: newUser,
  // });
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
      new AppError('Invalid credentials, could not log you in.', 403)
    );
  }

  // Remove the password field from the response
  identifiedUser.password = undefined;

  // If everything is ok, send token to the client
  createSentToken(identifiedUser, 200, res);

  // res.json({
  //   message: 'Logged in!',
  //   user: identifiedUser,
  // });
});

const protect = catchAsync(async (req, res, next) => {
  // Get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // return res.redirect('/');
    return next(
      new AppError('You are not logged in. Log in to get access', 403)
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 403)
    );
  }

  // Add userid to the request
  req.userData = { userId: decoded.id };

  //   // Grant acces to protected route
  //   req.user = currentUser;
  //   res.locals.user = currentUser;
  next();
});

/**
 * Log out a user removing token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express middleware function
 * @returns {Object} - JSON object containing a message confirming the user has logged in
 */
const logOut = (req, res) => {
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
};

///////////////////////////
// EXPORTS

exports.signUp = signUp;
exports.logIn = logIn;
exports.logOut = logOut;
exports.protect = protect;
