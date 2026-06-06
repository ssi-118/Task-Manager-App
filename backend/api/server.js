const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('../routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Task Manager API is running' });
});

// Database connection & Server startup
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
