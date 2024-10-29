// routes/conditionRoutes.js
const express = require('express');
const Condition = require('../models/Condition');
const { authenticate } = require('../middleware/auth'); // Assuming you have an authentication middleware
const router = express.Router();

const {
  createCondition,
  getConditions
} = require('../controllers/conditionController');


// Create a new condition for a device
router.post('/create-condition', createCondition);

// Get all conditions for a device
router.get('/get-conditions', getConditions);


// Add more routes for updating and deleting conditions as needed...

module.exports = router;
