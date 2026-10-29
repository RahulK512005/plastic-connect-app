const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getTransactions,
  deleteTransaction,
  clearTransactions,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(authenticate);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);
router.delete('/', clearTransactions);

module.exports = router;
