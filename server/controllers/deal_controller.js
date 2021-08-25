const { Transactions } = require('../models');
const { snapPayment } = require('../utils/payment');
const CustomError = require('../middlewares/error_handler');
const url = 'https://garagekita-db-server.herokuapp.com';
const axios = require('axios');
const moment = require('moment');

class Deal_Controller {
  static createDealTransaction = async (req, res, next) => {
    try {
      const { consumer_id, product_id, deal_price, deal_qty } = req.body;
      const data = { consumer_id, product_id, deal_price, deal_qty };
      const response = await axios.get(`${url}/products/${product_id}`);
      const { data: product } = response.data;

      if (!product) throw new CustomError('NotFound', `Product with id ${product_id} was not found`);

      const transaction = await Transactions.create(data);

      if (transaction) return res.status(201).json({ message: 'Transaction Created', data: transaction });
    } catch (error) {
      console.log('error on createDealTransaction', error.response);
      const { status, statusText } = error.response;

      if (status === 404) next({ name: 'NotFound', message: statusText });
      
      next(error);
    }
  };

  static getAllUserTransaction = async(req, res, next) => {
    try {
      const params = req.params.id || null;
      let code = 500;
      let response = null;
      let message = 'success';

      if (!params) {
        const data = await Transactions.findAll();
        code = 200;
        response = data;
      } else {
        const data = await Transactions.findByPk(params);

        if (!data) throw new CustomError('NotFound', `Transaction with id ${params} not found`);
        
        code = 200;
        response = data;
      }
      
      return res.status(code).json({ message, data: response });
    } catch (error) {
      console.log('error getAllUserTransaction', error);
      next(error);
    }
  };

  static deleteTransaction = async(req, res, next) => {
    try {
      const { id } = req.params;
      const data = await Transactions.destroy({
        where: { id },
        returning: true
      });
      let httpStatus = 404;
      let message = `Transaction with id ${id} was not found`;

      if (data) {
        httpStatus = 200;
        message = `Transaction id ${id} deleted`;
      }
      
      return res.status(httpStatus).json({ message });
    } catch (error) {
      console.log('error deleteTransaction', error);
      next(error);
    }
  };

  static updateTransaction = async(req, res, next) => {
    try {
      const { payment_status, request_id } = req.body;
      const transactionId = req.params.id;
      const response = await axios.get(`${url}/requests/${request_id}`);
      const { data: requestData } = response.data;
      const getTransactionById = await Transactions.findByPk(transactionId);

      if (!getTransactionById) throw new CustomError('NotFound', `Transaction ID ${transactionId} was not found`);

      const transaction = await Transactions.update({ payment_status, request_id }, {
        where: { id: transactionId },
        returning: true
      });

      if (transaction) {
        const productId = getTransactionById.product_id;
        const productResponse = await axios.get(`${url}/products/${productId}`);
        const { data: product } = productResponse.data;
        const productStockValue = product.stock - getTransactionById.deal_qty;
        const payload = {
          name: product.name,
          price: product.price,
          priceFloor: product.priceFloor,
          image_url: product.image_url,
          description: product.description,
          stock: productStockValue,
          category_id: product.category_id
        }
        const headers = { access_token: req.headers.access_token };
        const updateProductStock = await axios.put(`${url}/products/${productId}`, payload, { headers });
        const deleteRequest = await axios.delete(`${url}/requests/${requestData.id}`, { headers });

        const done = await Promise.all([updateProductStock, deleteRequest]);

        if(done) return res.status(200).json({ message: 'Update Success', data: transaction[1]});
      }
    } catch (error) {
      console.log('error updateTransaction', error);
      next(error);
    }
  }

  static processPayment = async(req, res, next) => {
    try {
      const { total_payment } = req.body;
      const { id } = req.params;
      const cekTransaction = await Transactions.findByPk(id);
      const transactionId = `TRNS_${moment().year()}${moment().month()}${moment().date()}${moment().hour()}${moment().minute()}${moment().second()}_00${id}`;

      if (!total_payment) return res.status(400).json({ message: 'Error', data: 'Please provide token_id and total_payment' });

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
};

module.exports = Deal_Controller