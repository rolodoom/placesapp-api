# PlacesApp-API

PlacesApp-API is a REST API built with Node.js, Express.js, and MongoDB, featuring various functionalities, including user authentication, CRUD operations and Geocoding.

This is the backend for [PlacesApp-Frontend](https://github.com/rolodoom/placesapp-frontend).

## Status

[![GitHub license](https://img.shields.io/badge/license-GPL--3.0-blue)](https://raw.githubusercontent.com/rolodoom/placesapp-api/main/LICENSE)

## Content

- [API Usage](#api-usage)
  - [API Endpoints](#api-endpoints)
    - [Authentication - Users](#authentication---users)
    - [Places](#places)
  - [API Documentation](#api-documentation)
  - [Middleware](#middleware)
  - [.ENV](#env)
- [Development Data](#development-data)
  - [Import data](#import-data)
  - [Delete data](#delete-data)
- [Bugs and Issues](#bugs-and-issues)
- [License](#license)

## API Usage

### API Endpoints

The API provides the following endpoints:

#### Authentication - Users

- User signup: `POST /api/v1/users/signup` (public)
- User login: `POST /api/v1/users/login` (public)
- User logout: `GET /api/v1/users/logout` (public)
- Get all users: `GET /api/v1/users` (public)

#### Places

- Get all places: `GET /api/v1/places` (public)
- Get all places by userid: `GET /api/v1/places/user/:uid` (public)
- Get single place by id: `GET /api/v1/places/:id` (public)
- Create place: `POST /api/v1/places` (private - user)
- Update place: `PATCH /api/v1/places/:id` (private - user)
- Delete place: `DELETE /api/v1/places/:id` (private - user)

### API Documentation

Please check [PlacesApp API Documentation](https://documenter.getpostman.com/view/19630013/2s93Y5Net7) for more information.

### Middleware

This project utilizes various middleware for tasks such as error handling, geocoding, etc. :

- `utils/appError.js`: for handling errors and sending appropriate responses
- `utils/catchAsync.js`: for handling async/await functions in Express routes
- `utils/geogode.js`: for converting addresses to coordinates using Mapbox API

### .ENV

You need to create an `.env` file for the application to work. There is a `sample.env` file that contains all configuration examples.

## Development Data

This projects includes a `dev-data`folder that contains json files with the development data for the application and can be imported into the database using `import-dev-data.js` script.

All passwords in `users.json` are randomly generated and encrypted, so don't forget to change this before importing.

### Import data

```bash
node dev-data/import-dev-data.js --import
```

### Delete data

Script also provides a way to delete the data from the database:

```bash
node dev-data/import-dev-data.js --delete
```

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/rolodoom/placesapp-api/issues) here on GitHub.

## License

This code is released under the [GPL-3.0](https://raw.githubusercontent.com/rolodoom/placesapp-api/main/LICENSE) license, which means you have the four freedoms to run, study, share, and modify the software. Any derivative work must be distributed under the same or equivalent license terms.
