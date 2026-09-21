require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aurellfeedback.fly.dev'
  ],
  credentials: true  
}));

// Helper to require route modules safely and log a helpful warning if missing
function safeRequireRoute(relPath) {
  try {
    // Resolve relative to this file's directory
    const fullPath = path.join(__dirname, relPath);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const route = require(fullPath);
    return route;
  } catch (err) {
    console.warn(`Warning: could not load route at "${relPath}".`, err.message);
    return null;
  }
}

/*
  Mount routes. Using explicit mount points (/auth, /feedback, /users)
  keeps route structure clear and avoids accidental route collisions.
  Adjust the relative paths below if your routes live elsewhere.
*/
const authRoutes = safeRequireRoute('./routes/auth');
if (authRoutes) app.use('/auth', authRoutes);

const feedbackRoutes = safeRequireRoute('./routes/feedback');
if (feedbackRoutes) app.use('/feedback', feedbackRoutes);

const userRoutes = safeRequireRoute('./routes/user');
if (userRoutes) app.use('/user', userRoutes);

const userLayoutRoutes = require("./routes/userLayout");
app.use("/userLayout", userLayoutRoutes);


// Optional: simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Basic error handler (keeps stack traces out of production)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;