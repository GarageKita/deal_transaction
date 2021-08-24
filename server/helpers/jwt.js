const jwt = require('jsonwebtoken');
const jwt_key = process.env.JWT_KEY

const decodePayload = (token) => {
  return jwt.verify(token, jwt_key);
};

module.exports = { decodePayload };