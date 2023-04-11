const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Place = require('../models/placeModel');
const User = require('../models/userModel');

dotenv.config();

// Database connection
const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<DATABASE>', process.env.DATABASE_NAME);

mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => {
  console.log('DB connection succesful!');
});

// Read JSON file
const places = JSON.parse(fs.readFileSync(`${__dirname}/places.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data into database
const importData = async () => {
  try {
    await Place.create(places);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data succesfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Place.deleteMany();
    await User.deleteMany();
    console.log('Data succesfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
