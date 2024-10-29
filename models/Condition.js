// models/Condition.js

const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device', // Reference to the Device model
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Condition = mongoose.model('Condition', conditionSchema);

module.exports = Condition;
