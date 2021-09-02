const router = require('express').Router();
const Deal_Controller = require('../controllers/deal_controller');
const PaymentController = require('../controllers/payment_controller');
const { checkToken } = require('../middlewares/auth');

router.post('/notifications', PaymentController.notifyCompletePayment);
router.use(checkToken);
router.post('/', Deal_Controller.createDealTransaction);
router.post('/payments/:id', PaymentController.processPayment);
router.get('/', Deal_Controller.getAllUserTransaction);
router.get('/me', Deal_Controller.getLoggedInUserTransaction);
router.get('/seller', Deal_Controller.getSellerTransaction);
router.get('/:id', Deal_Controller.getAllUserTransaction);
router.delete('/:id', Deal_Controller.deleteTransaction);
router.patch('/:id', Deal_Controller.updateTransaction);
router.patch('/shipping/:id', Deal_Controller.updateShippingStatus);

module.exports = router;