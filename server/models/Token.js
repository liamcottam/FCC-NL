const crypto = require('crypto');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 300,
    default: new Date(),
  },
});

TokenSchema.statics.createToken = function createToken(value) {
  const Token = this;
  return new Promise((resolve, reject) => {
    const rand = crypto.randomBytes(16).toString('hex');
    const token = new Token();
    token.token = rand;
    token.value = value;
    token.save(() => {
      resolve({ id: token._id, token: token.token });
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = mongoose.model('Token', TokenSchema);
