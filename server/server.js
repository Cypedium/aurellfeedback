// server/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app.js');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined. Check your .env file.');
  process.exit(1);
}

if (!PORT) {
  console.error('❌ PORT is not defined. Check your .env file.');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server started on port ${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Closing server and MongoDB connection...`);

      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed.");
        } catch (err) {
          console.error("Error closing MongoDB:", err);
        } finally {
          process.exit(0);
        }
      });

      setTimeout(() => {
        console.warn('Forcing shutdown.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
