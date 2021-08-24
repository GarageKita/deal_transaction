const { decodePayload } = require('../helpers/jwt');
const { Transactions } = require('../models');
const CustomError = require('../middlewares/error_handler');

const checkToken = async(req, res, next) => {
  try {
    const token = req.headers.access_token || null;
    const { id } = decodePayload(token);
    const validateUserId = await Transactions.authenticateUserId(id);
    const [data] = validateUserId;
    
    if (data) {
      const { id: user_id } = data;
      if (id !== user_id) throw new CustomError('Unauthorized', 'Invalid Credentials');
      
      req.currentState = { consumer_id: id };
      next();
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { checkToken };