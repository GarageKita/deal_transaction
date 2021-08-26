const { Transactions } = require('../models');
const { snapPayment, notificationHandler } = require('../utils/payment');
const moment = require('moment');
const url = 'https://garagekita-db-server.herokuapp.com';
const axios = require('axios');

class PaymentController {
  static processPayment = async(req, res, next) => {
    try {
      const { total_payment } = req.body;
      const { id } = req.params;
      const cekTransaction = await Transactions.findByPk(id);
      const transactionId = `TRNS_${moment().year()}${moment().month()}${moment().date()}${moment().hour()}${moment().minute()}${moment().second()}_00${id}`;

      if (!total_payment) return res.status(400).json({ message: 'Error', data: 'Please provide total_payment' });

      if (!cekTransaction) return res.status(404).json({ message: 'Error', data: `Transaction id ${id} not found` });

      const { data: product } = await axios.get(`${url}/products/${cekTransaction.product_id}`);
      const item = {
        name: product.data.name,
        price: cekTransaction.deal_price,
        category: product.data.Category.name,
        quantity: cekTransaction.deal_qty
      }
      const result = await snapPayment(total_payment, transactionId, [item]);
      
      return res.status(201).json({ message: 'success', data: result });
    } catch (error) {
      console.log('error processPayment', error);
      next(error);
    }
  };

  static notifyCompletePayment = async(req, res, next) => {
    try {
      const notificationResult = await notificationHandler(req.body);

      console.log('this is notification from midtrans', notificationResult);

      return res.status(200).json({ message: "ok" });
    } catch (error) {
      console.log('error notification', error);
      next(error);
    }
  };
};

module.exports = PaymentController;