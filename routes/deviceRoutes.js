const express = require('express');
const Device = require('../models/Device');
const User = require('../models/User'); // Import User model
const router = express.Router();

const {
  createDevice,
  getDevices
} = require('../controllers/deviceController');

// Create a new device (check by username)
router.post('/create-device', createDevice);
router.get('/get-devices', getDevices);

module.exports = router;
