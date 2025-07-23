const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const crypto = require('crypto');

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  console.log('Register request body:', req.body);

  if (!username || !email || !password || !confirmPassword || !role) {
    console.log('Registration failed: Missing fields');
    return res.status(400).json({ message: 'All fields are required including role' });
  }

  if (!['admin', 'employee'].includes(role)) {
    console.log('Registration failed: Invalid role');
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (password !== confirmPassword) {
    console.log('Registration failed: Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: Email already registered');
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = new User({ username, email, password, role, isRegistered: true });

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    user.isVerified = false;

    await user.save();

    // Send OTP to user's email using nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"FormFlow" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
    }

    res.status(201).json({ message: 'User registered. Please verify OTP sent to your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'User not verified. Please verify your email.' });
    }

    // Ensure isRegistered is true if user has completed registration criteria
    if (!user.isRegistered) {
      // For example, check if user has username and email set
      if (user.username && user.email) {
        user.isRegistered = true;
        await user.save();
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, isRegistered: user.isRegistered } });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Login error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const userId = decoded.id;

    // Fetch user profile
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ id: user._id, username: user.username, email: user.email, role: user.role, isRegistered: user.isRegistered });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
