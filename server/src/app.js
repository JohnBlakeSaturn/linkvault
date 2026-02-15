const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const connectDB = require('./config/connect');
const configurePassport = require('./config/passport');
const securityHeaders = require('./middleware/securityHeaders');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { startExpiryCleanup } = require('./services/expiryCleanup');

configurePassport(passport);

app.use(cors());
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'linkvault.sid',
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use('/api/auth', authRoutes);
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

async function startServer() {
  await connectDB();
  startExpiryCleanup();
  app.listen(3000, () => {
    console.log('Serving on port 3000');
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
