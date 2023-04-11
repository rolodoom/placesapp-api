///////////////////////////
// CORE MODULES

const express = require('express');

///////////////////////////
// CONTROLLERS

const { getAllUsers, signUp, logIn } = require('../controllers/userController');

///////////////////////////
// ROUTER

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/signup').post(signUp);
router.route('/login').post(logIn);

module.exports = router;
