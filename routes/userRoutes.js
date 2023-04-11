///////////////////////////
// CORE MODULES

const express = require('express');

///////////////////////////
// CONTROLLERS

const { signUp, logIn, logOut } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');

///////////////////////////
// ROUTER

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/signup').post(signUp);
router.route('/login').post(logIn);
router.route('/logout').get(logOut);

module.exports = router;
