const User = require('../models/User'); 
const Device = require('../models/Device'); 

exports.createDevice = async (req, res) => {
  // Validate input
  if (!username || !deviceName) {
    return res.status(400).json({ error: 'Username and Device Name are required' });
  }

  try {
    // Check if the user exists by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new device
    const newDevice = new Device({
      user: user._id, // Link the device to the user by ID
      deviceName,
    });

    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device', details: error.message });
  }
};

exports.getDevices = async (req, res) => {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    try {
      // Check if the user exists by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Retrieve all devices for the user
      const devices = await Device.find({ user: user._id });
      res.status(200).json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Failed to fetch devices', details: error.message });
    }
};