'use strict';
const { Model, QueryTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static async authenticateUserId(id) {
      const sql = `SELECT * FROM "Users" u WHERE u.id = $id`;
      const options = { 
        bind: { id },
        type: QueryTypes.SELECT,
        raw: true
      };
      const users = await sequelize.query(sql, options);

      return users;
    }

    static async getProductById(id) {
      const sql = `SELECT * FROM "Products" product where product.id = $id`;
      const options = {
        bind: { id },
        type: QueryTypes.SELECT,
        raw: true
      };
      const product = await sequelize.query(sql, options);

      return product;
    }
  };
  Transactions.init({
    consumer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Attribute consumer_id cannot be empty string'
        },
        isInt: {
          args: true,
          msg: 'Attribute consumer_id must be in integer'
        }
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Attribute product_id cannot be empty string'
        },
        isInt: {
          args: true,
          msg: 'Attribute product_id must be in integer'
        }
      }
    },
    deal_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Attribute deal_price cannot be empty string'
        },
        isInt: {
          args: true,
          msg: 'Attribute deal_price must be in integer'
        }
      }
    },
    deal_qty: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Attribute deal_qty cannot be empty string'
        },
        isInt: {
          args: true,
          msg: 'Attribute deal_qty must be in integer'
        }
      }
    },
    payment_status: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['awaiting', 'paid']],
          msg: 'Attribute payment_status must between awaiting or paid'
        }
      }
    },
    request_id: DataTypes.STRING,
    order_id: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    disburse_status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};