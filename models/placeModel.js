///////////////////////////
// CORE MODULES

const mongoose = require('mongoose');

///////////////////////////
// SCHEMA DEFINITION

const placeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String,
      default: 'default-place.png',
      required: true,
    },
    address: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

///////////////////////////
// EXPORT

module.exports = mongoose.model('Place', placeSchema);
