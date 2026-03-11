const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Main Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import Routes
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/auth', require('./routes/auth'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    // Only handle GET requests that don't start with /api
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} using MongoDB Atlas`);

  // Keep-alive ping for Render Free Tier (every 14 minutes)
  const url = process.env.RENDER_EXTERNAL_URL;
  if (url) {
    console.log(`Keep-alive configured for: ${url}`);
    setInterval(async () => {
      try {
        const response = await fetch(`${url}/api/health`);
        if (response.ok) {
          console.log('Keep-alive ping successful');
        } else {
          console.warn(`Keep-alive ping returned status: ${response.status}`);
        }
      } catch (err) {
        // Silently handle timeouts or network errors to avoid log spam
        // These are common during Render's internal network shifts
        if (err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'ECONNREFUSED') {
          console.log('Keep-alive ping timed out (Internal network skip)');
        } else {
          console.error('Keep-alive ping unexpected error:', err.message);
        }
      }
    }, 14 * 60 * 1000);
  }
});
