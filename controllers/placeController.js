///////////////////////////
// CORE MODULES

const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

///////////////////////////
// APP MODULES

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const getCoordinatesForAddress = require('../utils/geocode');
const Place = require('../models/placeModel');
const User = require('../models/userModel');

///////////////////////////
// FUNCTIONS

/**
 * Retrieves all places from the database and returns them to the client
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing all places in the database
 */
const getAllPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find();

  res.json({
    results: places.length,
    places,
  });
});

/**
 * Retrieves a Place instance from the database by its ID and returns it to the client
 *
 * @param {object} req - Express request object containing the place ID
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing the retrieved Place instance
 */
const getPlaceById = catchAsync(async (req, res, next) => {
  // Find the Place instance in the database by its ID
  const place = await Place.findById(req.params.pid);

  // If the Place instance is not found, return a 404 error to the client
  if (!place) {
    return next(
      new AppError('Could not find a place for the provided id.', 404)
    );
  }

  // If the Place instance is found, return it to the client
  res.json({
    place,
  });
});

/**
 * Function to retrieve all places created by a given user id
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing all places created by the user with provided id
 */
const getPlacesByUserId = catchAsync(async (req, res, next) => {
  const userId = req.params.uid;

  // Find all places created by the user with provided id
  const places = await Place.find({ creator: userId });

  // Check if places were found
  if (!places || places.length === 0) {
    return next(
      new AppError('Could not find any place for the provided user id.', 404)
    );
  }

  // Return a response with the found places
  res.json({
    results: places.length,
    places,
  });
});

/**
 * Creates a new Place instance with the provided data and saves it to the database
 *
 * @param {object} req - Express request object containing the data for the new Place instance
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing the created Place instance
 */
const createPlace = catchAsync(async (req, res, next) => {
  // Get current userId
  const creator = req.userData.userId;

  // Check for input validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If errors exist, return a 422 error to the client
    return next(
      new AppError('Invalid inputs passed, please check your data.', 422)
    );
  }

  // Extract necessary data from the request body
  const { title, description, image, address } = req.body;

  // Convert the address to geographic coordinates using an external API
  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    // If an error occurs during the conversion, pass it to the global error handler
    return next(error);
  }

  // Check if creator is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(creator)) {
    return next(new AppError('Invalid creator ID.', 400));
  }

  // Find the user with the specified creator ID
  const user = await User.findById(creator);
  if (!user) {
    return next(new AppError('We could not find user for provided id.', 404));
  }

  // Check if the user already has a place with the same title
  const existingPlace = await Place.findOne({ title: title, creator: creator });

  if (existingPlace) {
    return next(
      new AppError('You already have a place with the same title.', 400)
    );
  }

  // Create a new Place instance with the extracted data and the geographic coordinates
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    creator,
    image,
  });

  // Save the new Place instance to the database
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // Save the new place to the database
    await createdPlace.save({ session: sess });

    // Add the new place ID to the user's places array
    await User.updateOne(
      { _id: user._id },
      { $push: { places: createdPlace._id } },
      { session: sess }
    );

    sess.commitTransaction();
  } catch (error) {
    console.log(error);
    // If an error occurs during the save operation, pass it to the global error handler
    return next(error);
  }

  // Return a 201 status code and the new Place instance to the client
  res.status(201).json({
    place: createdPlace,
  });
});

/**
 * Updates an existing Place instance with the provided data and returns the updated instance
 *
 * @param {object} req - Express request object containing the place ID and data to be updated
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {json} - Response containing the updated Place instance
 */
const updatePlace = catchAsync(async (req, res, next) => {
  // Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Invalid inputs passed, please check your data.', 422)
    );
  }

  // Get values from request
  const { title, description, image } = req.body;
  const placeId = req.params.pid;

  // Find if the pkace exists!
  const place = await Place.findById(placeId);
  if (!place) {
    return next(
      new AppError('Could not find a place for the provided id.', 404)
    );
  }

  // Check if the place is own by the current logged user
  if (place.creator.toString() !== req.userData.userId) {
    return next(new AppError('You are not allowed to update this place.', 403));
  }

  const updatedPlace = await Place.findByIdAndUpdate(
    placeId,
    {
      title,
      description,
      image,
    },
    {
      new: true, //  return the new object
      runValidators: true, // Enable all validators
    }
  );

  // Check if the place was found and updated
  if (!updatedPlace) {
    return next(new AppError('Could not update the place.', 500));
  }

  // Send response with the updated place
  res.status(200).json({
    place: updatedPlace,
  });
});

/**
 * Deletes a place with the provided ID from the database
 *
 * @param {Object} req - Express request object containing the ID of the place to delete
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>} - Promise that resolves with no value upon successful deletion of the place
 * @throws {AppError} - Throws an error if the place with the provided ID could not be found in the database
 */
const deletePlace = catchAsync(async (req, res, next) => {
  const placeId = req.params.pid;

  // Find the place by its ID
  const place = await Place.findById(placeId);

  // If the place was not found, return an error response
  if (!place) {
    return next(
      new AppError('Could not find a place for the provided id.', 404)
    );
  }

  // Check if the place is own by the current logged user
  if (place.creator.toString() !== req.userData.userId) {
    return next(new AppError('You are not allowed to delete this place.', 403));
  }

  // Remove the placeId from the user's 'places' array
  const userId = place.creator._id;
  await User.updateOne({ _id: userId }, { $pull: { places: placeId } });

  // Delete the place from the database
  await Place.findByIdAndDelete(placeId);

  // Return a success response
  res.status(204).send();
});

///////////////////////////
// EXPORTS

exports.getAllPlaces = getAllPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
exports.createPlace = createPlace;
