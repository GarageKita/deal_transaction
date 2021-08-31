if (process.env.NODE_ENV !== 'production') require('dotenv').config()
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
      const transactionId = `TRNS_${moment().year()}${moment().month()}${moment().date()}${moment().hour()}${moment().minute()}_00${id}`;

      if (!total_payment) {
        return res.status(400).json({ message: 'Error', data: 'Please provide total_payment' });
      };

      if (!cekTransaction) {
        return res.status(404).json({ message: 'Error', data: `Transaction id ${id} not found` });
      };

      const { data: product } = await axios.get(`${url}/products/${cekTransaction.product_id}`);
      const item = {
        name: product.data.name,
        price: cekTransaction.deal_price,
        category: product.data.Category.name,
        quantity: cekTransaction.deal_qty
      }
      const result = await snapPayment(total_payment, transactionId, [item]);

      if(result) {
        await Transactions.update({ order_id: transactionId }, {
          where: { id },
        });
      }

      return res.status(201).json({ message: 'success', data: result });
    } catch (error) {
      console.log('error processPayment', error);
      next(error);
    }
  };

  static notifyCompletePayment = async(req, res, next) => {
    try {
      const notificationResult = await notificationHandler(req.body);      
      //! DEVELOPMENT MODE 
      //! const notificationResult = req.body;
      const admin_key = process.env.ADMIN_TOKEN;
      const headers = { access_token: admin_key };

      if (notificationResult.status_code === '200') {
        const { order_id, payment_type, transaction_status, fraud_status} = notificationResult;
        const checkTransaction = await Transactions.findOne({
          where: { order_id: order_id }
        });

        if (checkTransaction && (transaction_status === 'capture' || transaction_status === 'settlement') && fraud_status === 'accept') {          
          const { data:product } = await axios.get(`${url}/products/${checkTransaction.product_id}`);
          const productStockUpdate = product.data.stock - checkTransaction.deal_qty;
          const dataProduct = {
            name: product.data.name,
            price: product.data.price,
            priceFloor: product.data.priceFloor,
            image_url: product.data.image_url,
            description: product.data.description,
            stock: productStockUpdate,
            category_id: product.data.category_id
          };
          const updateProduct = await axios.put(`${url}/products/${checkTransaction.product_id}`, dataProduct, { headers });
          if (checkTransaction.request_id) {
            await axios.delete(`${url}/requests/${checkTransaction.request_id}`, { headers });
          }
          const result = await Promise.all([updateProduct]);

          if (result) {
            await Transactions.update({ payment_status: 'paid', payment_type: payment_type}, {
              where: { order_id: order_id }
            });
          };
        };
      }

      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      console.log('error notification', error);
      next(error);
    }
  };
};

module.exports = PaymentController;