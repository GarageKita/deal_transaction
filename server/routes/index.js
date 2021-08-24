const router = require('express').Router();
const Deal_Controller = require('../controllers/deal_controller');

router.post('/', Deal_Controller.createDealTransaction);
router.get('/', Deal_Controller.getAllUserTransaction);
router.get('/:id', Deal_Controller.getAllUserTransaction);
router.delete('/:id', Deal_Controller.deleteTransaction);
router.patch('/:id', Deal_Controller.updateTransaction);

module.exports = router;