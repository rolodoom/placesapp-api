/////////////////////////////////
// CORE MODULES

const mongoose = require('mongoose');
const dotenv = require('dotenv');

/////////////////////////////////
// APP CONFIG

dotenv.config();
const app = require('./app');

/////////////////////////////////
// DATABASE

// connection
const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<DATABASE>', process.env.DATABASE_NAME);

// Mongoose
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => {
  console.log('DB connection succesful!');
});

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Handle Unhandle Rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! 💥 Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
