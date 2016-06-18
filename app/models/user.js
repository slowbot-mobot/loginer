var db      = require('../services/db');

module.exports = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});
