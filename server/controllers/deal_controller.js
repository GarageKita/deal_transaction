if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { Transactions } = require('../models');
const CustomError = require('../middlewares/error_handler');
const url = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : process.env.URL_MAIN_GARAGE_KITA;
const axios = require('axios');

class Deal_Controller {
  static createDealTransaction = async (req, res, next) => {
    try {
      const { consumer_id, product_id, deal_price, deal_qty, request_id, address_id } = req.body;
      const data = {
        consumer_id, 
        product_id,
        deal_price,
        deal_qty,
        request_id,
        address_id,
        shipping_status: 'undeliver',
      };
      const response = await axios.get(`${url}/products/${product_id}`);
      const { data: product } = response.data;

      if (!product) {
        throw new CustomError('NotFound', `Product with id ${product_id} was not found`);
      }

      const transaction = await Transactions.create(data);

      if (transaction) {
        return res.status(201).json({ message: 'Transaction Created', data: transaction });
      }
    } catch (err) {
      console.log('error on createDealTransaction', err.name);
      console.log(err);

      next(err);
    }
  };

  static getAllUserTransaction = async(req, res, next) => {
    try {
      const params = req.params.id || null;
      let code = 500;
      let response = null;
      let message = 'success';

      if (!params) {
        const data = await Transactions.getAllTransactions();
        code = 200;
        response = data;
      } else {
        const [data] = await Transactions.getAllTransactions(params);
        
        if (!data) {
          throw new CustomError('NotFound', `Transaction with id ${params} not found`);
        }
        
        code = 200;
        response = data;
      }
      
      return res.status(code).json({ message, data: response });
    } catch (error) {
      console.log('error getAllUserTransaction', error);
      next(error);
    }
  };

  static getLoggedInUserTransaction = async(req, res, next) => {
    try {
      const { consumer_id: userId } = req.currentState;
      const loggedInUserTransaction = await Transactions.getLoggedInUserTransaction(userId);

      res.status(200).json({ message: 'success', data: loggedInUserTransaction});
    } catch (error) {
      console.log('error getLoggedInUserTransaction', error);
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

  static updateShippingStatus = async(req, res, next) => {
    try {
      const { id: transactionId } = req.params;
      const payload = req.body;
      const getTransaction = await Transactions.findByPk(transactionId);

      if (!getTransaction) {
        throw new CustomError('NotFound', `Transaction id ${transactionId} not found!`);
      }

      const field = {
        shipping_status: payload.shipping_status,
      };
      const condition = {
        where: { id: transactionId },
        returning: true
      }
      const updateTransaction = await Transactions.update(field, condition);
      
      if (updateTransaction) {
        res.status(200).json({ message: 'success', data: updateTransaction[1]});
      }
    } catch (error) {
      console.log('error updateShippingStatus');
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
};

module.exports = Deal_Controller