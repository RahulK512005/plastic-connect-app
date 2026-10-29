const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  createOrder,
  updateOrderStatus,
  getCollectorOrders,
  getBuyerOrders,
  createOrderValidation,
} = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate);

// Buyer creates order
router.post('/', createOrderValidation, createOrder);

// Collector accepts/rejects order
router.put('/:id/status', updateOrderStatus);

// Get all orders for a collector
router.get('/collector', getCollectorOrders);
router.get('/collector/:id', getCollectorOrders);

// Get all orders for a buyer
router.get('/buyer', getBuyerOrders);
router.get('/buyer/:id', getBuyerOrders);

module.exports = router;
