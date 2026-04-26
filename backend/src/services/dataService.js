'use strict';

/**
 * dataService is the single import used by all routes.
 * To swap the data source (e.g. replace Sequelize with an HTTP API client),
 * create a new module that exports the same functions and update this file.
 */
const dataService = require('./sequelizeDataService');

module.exports = dataService;
