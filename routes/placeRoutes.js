///////////////////////////
// CORE MODULES

const express = require('express');
const { check } = require('express-validator');

///////////////////////////
// CONTROLLERS

const {
  getAllPlaces,
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  deletePlace,
  updatePlace,
} = require('../controllers/placeController');

///////////////////////////
// ROUTER

const router = express.Router();

router
  .route('/')
  .get(getAllPlaces)
  .post(
    [
      check('title').not().isEmpty(),
      check('description').isLength({ min: 5 }),
      check('address').not().isEmpty(),
    ],
    createPlace
  );
router
  .route('/:pid')
  .get(getPlaceById)
  .patch(
    [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
    updatePlace
  )
  .delete(deletePlace);
router.route('/user/:uid').get(getPlacesByUserId);

module.exports = router;
