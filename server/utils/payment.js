if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const midtransClient = require('midtrans-client');
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;

const creditPay = async (amount, order_id, token_id) => {
  // CoreAPI instance
  const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: SERVER_KEY,
    clientKey: CLIENT_KEY
  });
  
  const parameter = {
    "payment_type": "credit_card",
    "transaction_details": {
      "gross_amount": amount,
      "order_id": order_id,
    },
    "credit_card": {
      "token_id": token_id,
      "authentication": true,
    },
  };

  const result = await core.charge(parameter)
  
  return result;
};

const snapPayment = async(amount, order_id, item_detail) => {
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: SERVER_KEY
  });
  const parameter = {
    "transaction_details": {
      "order_id": order_id,
      "gross_amount": amount
    },
    "item_details": item_detail,
    "credit_card": {
      "secure": true,
    },
  };
  const result = await snap.createTransaction(parameter);

  return result;
};

module.exports = { creditPay, snapPayment };