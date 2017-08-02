module.exports = function ValidationError(extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'InputValidationError';
  this.errors = extra;
};

require('util').inherits(module.exports, Error);
