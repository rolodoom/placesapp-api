/////////////////////////////////
// CORE MODULES

const axios = require('axios');
const AppError = require('./appError');

const API_KEY = process.env.MAPBOX_API_KEY;

/////////////////////////////////
// FUNCTIONS

const getCoordinatesForAddress = async address => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${API_KEY}`;

  try {
    const { data } = await axios.get(url);

    if (!data.features || data.features.length === 0) {
      throw new AppError(
        `Could not find coordinates for address: ${address}`,
        422
      );
    }

    const [lng, lat] = data.features[0].center;

    return { lat, lng };
  } catch (error) {
    throw new AppError(
      `Could not get coordinates for address: ${address}. Error: ${error}`,
      422
    );
  }
};

/////////////////////////////////
// EXPORTS

module.exports = getCoordinatesForAddress;
