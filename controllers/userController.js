///////////////////////////
// APP MODULES

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

///////////////////////////
// EXPORTS

exports.getAllUsers = getAllUsers;
