/////////////////////////////////
// CORE MODULES

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

/////////////////////////////////
// APP MODULES

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const placeRouter = require('./routes/placeRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/////////////////////////////////
// MIDDLEWARE

// Set security HTTP headers
app.use(helmet());

// Enable CORS with cors
app.use(
  cors({
    origin: process.env.FRONTEND_SERVER_URLS.split(','),
  })
);

// Developement logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests to API from same IP
const limiter = rateLimit({
  max: process.env.API_LIMIT || 100,
  windowMs: 60 * 60 * 1000, // 1h into ms
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/////////////////////////////////
// ROUTES

// API Routes
app.use('/api/v1/places', placeRouter);
app.use('/api/v1/users', userRouter);

// Capture unused routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
