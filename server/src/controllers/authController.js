const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

const SALT_ROUNDS = 12;

function sanitizeName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sanitizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validateName(name) {
  return /^[a-zA-Z][a-zA-Z\s'-]{1,79}$/.test(name);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && password.length <= 128
    && /[A-Za-z]/.test(password)
    && /\d/.test(password);
}

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

exports.register = async (req, res) => {
  try {
    const name = sanitizeName(req.body.name);
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Invalid name. Use 2-80 letters/spaces only.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be 8-128 chars with letters and numbers.' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    return req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).json({ error: 'Account created, but failed to start session.' });
      }

      return res.status(201).json({ success: true, user: toSafeUser(user) });
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid email or password' });
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.json({ success: true, user: toSafeUser(user) });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Server error' });
    }

    req.session.destroy(() => {
      res.clearCookie('linkvault.sid');
      return res.json({ success: true });
    });
  });
};

exports.me = (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, user: toSafeUser(req.user) });
};
