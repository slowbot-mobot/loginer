require('dotenv').config();

var config      = require('../../knexfile.js');
var env         = process.env.environment || 'development';
var knex        = require('knex')(config[env]);
var bookshelf   = module.exports = require('bookshelf')(knex);

knex.migrate.latest([config]);

module.exports = bookshelf;

console.log("Database configured!");
