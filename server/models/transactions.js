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

    static async getAllTransactions(id = null) {
      const queryParams = (id) ? 'where t.id = $id' : 'where 1=1';
      const sql = `
        select
          t.*, u.email as customer_email, p.seller_id, p.name as product_name, p.image_url, s.email as seller_email, p.description
        from "Transactions" t
          inner join "Users" u on u.id = t.consumer_id
          inner join "Products" p on p.id = t.product_id
          inner join "Users" s on s.id  = p.seller_id
          ${queryParams}
      `;
      const options = (id) ? {
        bind: { id },
        type: QueryTypes.SELECT,
        raw: true
      } : {
        type: QueryTypes.SELECT,
        raw: true
      };
      const transactions = await sequelize.query(sql, options);

      return transactions;
    }

    static async getLoggedInUserTransaction (userId) {
      const sql = `
        select
          t.*, u.email as customer_email, p.seller_id, p.name as product_name, p.image_url, s.email as seller_email, p.description
        from "Transactions" t
          inner join "Users" u on u.id = t.consumer_id
          inner join "Products" p on p.id = t.product_id
          inner join "Users" s on s.id  = p.seller_id
        where t.consumer_id = $consumer_id
      `;
      const options = {
        bind: { consumer_id: userId },
        type: QueryTypes.SELECT,
        raw: true
      };
      const results = await sequelize.query(sql, options);

      return results;
    }

    static async getSellerTransaction (sellerId) {
      const sql = `
        select
          t.*, u.email as customer_email, p.seller_id, p.name as product_name, p.image_url, s.email as seller_email, p.description
        from "Transactions" t
          inner join "Users" u on u.id = t.consumer_id
          inner join "Products" p on p.id = t.product_id
          inner join "Users" s on s.id  = p.seller_id
        where p.seller_id = $sellerId
      `;
      const options = {
        bind: { sellerId: sellerId },
        type: QueryTypes.SELECT,
        raw: true
      };
      const results = await sequelize.query(sql, options);

      return results;
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    request_id: DataTypes.STRING,
    order_id: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    disburse_status: DataTypes.BOOLEAN,
    shipping_status: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['undeliver', 'delivering', 'completed']],
          msg: 'Attributes shipping_status must between undeliver, delivering or completed',
        }
      }
    },
    address_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};