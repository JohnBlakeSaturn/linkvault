const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/connect');
const uploadRoutes = require('./routes/uploadRoutes');


connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api', uploadRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API is working!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
})

app.get('/api/hello', (req, res) => {
    res.json({message: "Hello from the server"});
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})