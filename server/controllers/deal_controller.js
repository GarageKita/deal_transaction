const { Transactions } = require('../models');
const CustomError = require('../middlewares/error_handler');

class Deal_Controller {
  static createDealTransaction = async (req, res, next) => {
    try {
      const { consumer_id, product_id, deal_price, deal_qty } = req.body;
      const data = { consumer_id, product_id, deal_price, deal_qty };
      const [product] = await Transactions.getProductById(product_id);

      if (!product) throw new CustomError('NotFound', `Product with id ${product_id} was not found`);

      const transaction = await Transactions.create(data);

      if (transaction) return res.status(201).json({ message: 'Transaction Created', data: transaction });
    } catch (error) {
      console.log('error on createDealTransaction', error);
      next(error)
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
};

module.exports = Deal_Controller