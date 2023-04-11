///////////////////////////
// CORE MODULES

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

///////////////////////////
// SCHEMA DEFINITION

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Need to provide a name'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Provide a valide email'],
    },
    password: {
      type: String,
      required: [true, 'Enter your password'],
      minlength: ['8', 'Password must be at least 8 characters long'],
      select: false,
    },
    image: {
      type: String,
      default: 'default-user.png',
    },
    places: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Place',
        required: true,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

///////////////////////////
// PRE MIDDLEWARE

/**
 * Middleware function that hashes the user's password before saving it to the database
 * @function
 * @name hashPassword
 * @memberof UserSchema
 * @async
 * @param {function} next - Mongoose middleware function
 * @returns {void}
 */
userSchema.pre('save', async function (next) {
  // Hash de password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

///////////////////////////
// METHODS

/**
 * Method that compares a given password with the user's hashed password
 * @function
 * @name correctPassword
 * @memberof UserSchema
 * @async
 * @param {string} candidatePassword - Password to be compared
 * @param {string} userPassword - User's hashed password to compare against
 * @returns {boolean} - Returns true if the passwords match, false otherwise
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

///////////////////////////
// EXPORT

module.exports = mongoose.model('User', userSchema);
