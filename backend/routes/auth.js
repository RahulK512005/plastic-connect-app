const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, registerValidation, loginValidation } = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' },
});

router.post('/register', registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);

module.exports = router;
