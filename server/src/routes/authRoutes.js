const express = require('express');
const authController = require('../controllers/authController');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const authWriteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  scope: 'auth-write',
});

router.post('/register', authWriteLimiter, authController.register);
router.post('/login', authWriteLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;
