const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://aurellfeedback.fly.dev',
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json());
app.use(require("cors")({ origin: true, credentials: true }));

// Auth routes
app.use("/", require("../routes/auth"));

// Feedback routes
app.use("/", require("../routes/feedback"));

// Users routes
app.use("/", require("../routes/user"));

app.use(express.json());

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user.' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ accessToken, refreshToken });

  } catch (err) {
    res.status(500).json({ message: 'Error logging in.' });
  }
});

// Logout user
app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully. Please discard your token.' });
});

// Submit feedback
app.post('/feedback', async (req, res) => {
  const { rating, comment, productId, username, submittedAt } = req.body;
  try {
    const newFeedback = new Feedback({ rating, comment, productId, username, submittedAt });
    console.log('Saving feedback:', newFeedback);
    await newFeedback.save();
    res.status(200).json({ message: 'Feedback saved successfully!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

// Get all feedbacks
app.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    console.log('Fetched feedbacks:', feedbacks);
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Could not retrieve feedbacks.' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username pictureUrl');
    console.log('Fetched users:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Could not retrieve users.' });
  }
});

// Delete feedback
app.delete('/feedback/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: 'Feedback deleted successfully.' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Could not delete feedback.' });
  }
});

// 🔄 Refresh token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Skapa ny access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});

export defaults = app;