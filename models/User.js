const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    authCode: { type: String }, // Add this line
    authCodeExpires: { type: Date }, // Optional: to set an expiration time for the code
    resetToken: { type: String }, // Field to store the reset token
    resetTokenExpiration: { type: Date },
  });

// Ensure you export the Mongoose model correctly
module.exports = mongoose.model('User', userSchema);