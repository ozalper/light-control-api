const User = require('../models/User'); 
const Device = require('../models/Device');
const Condition = require('../models/Condition');   

exports.createCondition = async (req, res) => {
    const { deviceId, condition } = req.body;

  try {
    const newCondition = new Condition({
      device: deviceId, // The ID of the device this condition belongs to
      condition,
    });

    await newCondition.save();
    res.status(201).json(newCondition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create condition', details: error.message });
  }
};

exports.getConditions = async (req, res) => {
    const deviceId = req.body;

    try {
        const conditions = await Condition.find({ device: req.params.deviceId });
        res.status(200).json(conditions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conditions', details: error.message });
    }
};