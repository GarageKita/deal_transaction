'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      const order_id = await queryInterface.addColumn('Transactions', 'order_id', { type: Sequelize.STRING });
      const payment_type = await queryInterface.addColumn('Transactions', 'payment_type', { type: Sequelize.STRING });

      return Promise.all([order_id, payment_type]);
    } catch (error) {
      console.log('error migration', error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      const order_id = await queryInterface.removeColumn('Transactions', 'order_id', {});
      const payment_type = await queryInterface.removeColumn('Transactions', 'payment_type', {});

      return Promise.all([order_id, payment_type]);
    } catch (error) {
      console.log('error reverting migration', error);
    }
  }
};
