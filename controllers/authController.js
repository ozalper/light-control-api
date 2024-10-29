const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
// JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// Helper to generate JWT token
const generateToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

// Transporter for sending emails (nodemailer)


const generateAuthCode = () => {
    const authCode = Math.floor(100000 + Math.random() * 900000);
    return authCode.toString(); // Convert to string if needed
  };

const generateAuthCodeReset = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let authCode = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    authCode += characters[randomIndex];
  }

  return authCode; // Return the mixed code
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use 465 for SSL
  secure: false, // Set to true if using port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// --- SIGNUP ---
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup Error:', error); // Log full error
    res.status(500).json({ error: 'User creation failed', details: error.message });
  }
};

// --- LOGIN ---
const crypto = require('crypto'); // Add this to generate random codes

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
   
    // Generate a random authentication code
    const authCode = generateAuthCode(); // Generates a 6-character number code

    // Send the authentication code via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email.toString(),
      subject: 'Your Authentication Code',
      text: `Your authentication code is: ${authCode}`,
    };

    await transporter.sendMail(mailOptions);

    // Save the auth code in the user object (or create a separate structure for temp storage)
    user.authCode = authCode;
    await user.save();

    // Respond to the client indicating that the email was sent
    res.status(200).json({ message: 'Login successful, please check your email for the authentication code.' });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};


// --- AUTHENTICATE TOKEN MIDDLEWARE ---
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded; // Attach user info to request
    next();
  });
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
  const userId = req.user.id; // Retrieved from JWT middleware

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// --- FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // Generate the reset token
      const resetToken = generateAuthCodeReset(); 
      const expirationTime = Date.now() + 3600000; // Token valid for 1 hour
  
      // Save the token and expiration time to the user record
      user.resetToken = resetToken;
      user.resetTokenExpiration = expirationTime;
      await user.save();
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Use this token to reset your password: ${resetToken}`,
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  };

  exports.resetPassword = async (req, res) => {
    const { email, resetToken, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // Check if the reset token is valid and not expired
      if (user.resetToken !== resetToken || Date.now() > user.resetTokenExpiration) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
  
      // Hash the new password and update the user's record
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined; // Clear the reset token
      user.resetTokenExpiration = undefined; // Clear the expiration time
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset Password Error:', error);
      res.status(500).json({ error: 'Password reset failed' });
    }
  };
