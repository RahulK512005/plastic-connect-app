const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getProfile, updateProfile, browseListing } = require('../controllers/brandController');

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/listings/browse', browseListing);

module.exports = router;
