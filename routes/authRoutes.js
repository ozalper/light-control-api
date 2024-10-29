const express = require('express');
const {
  signup,
  login,
  authenticate,
  deleteUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.delete('/delete', authenticate, deleteUser); // Protected route
router.post('/reset-password', resetPassword);

module.exports = router;