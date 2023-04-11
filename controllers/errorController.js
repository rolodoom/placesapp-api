const mongoose = require('mongoose');

const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const validationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data in ${
    errors.length
  } field(s). ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const documentNotFoundErrorDB = () => new AppError('Document not found', 404);

const sendError = (err, req, res) => {
  res.status(err.statusCode || 500);
  res.json({ message: err.message || 'An unknown error ocurred' });
};

module.exports = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err instanceof mongoose.Error.CastError) {
    // Handle CastError
    err = handleCastErrorDB(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Handle ValidationError
    err = validationErrorDB(err);
  } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
    // Handle DocumentNotFoundError
    err = documentNotFoundErrorDB(err);
  }

  if (err.code === 11000) err = handleDuplicateFieldsDB(err);

  sendError(err, req, res);
};
