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
      const shipping_status = await queryInterface.addColumn('Transactions', 'shipping_status', { type: Sequelize.STRING });
      const address_id = await queryInterface.addColumn('Transactions', 'address_id', { type: Sequelize.INTEGER });

      return Promise.all([shipping_status, address_id]);
    } catch (error) {
      console.error('error migration', error)
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
      const shipping_status = await queryInterface.removeColumn('Transactions', 'shipping_status', {});
      const address_id = await queryInterface.removeColumn('Transactions', 'address_id', {});

      return Promise.all([shipping_status, address_id]);
    } catch (error) {
      console.log('error reverting migration', error);
    }
  }
};
