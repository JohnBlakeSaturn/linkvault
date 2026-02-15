import bcrypt from 'bcryptjs';
import passport from 'passport';
import { User } from '../models/User.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const sanitizedName = String(name || '')
      .replace(/[^\w\s'.-]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const normalizedPassword = String(password || '');

    if (!sanitizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (sanitizedName.length < 2 || sanitizedName.length > 80) {
      return res.status(400).json({ message: 'Name must be 2-80 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    if (normalizedPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 12);
    const user = await User.create({
      name: sanitizedName,
      email: normalizedEmail,
      passwordHash
    });

    req.login(user, (error) => {
      if (error) return next(error);
      return res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email }
      });
    });
  } catch (error) {
    next(error);
  }
}

export function login(req, res, next) {
  passport.authenticate('local', (error, user, info) => {
    if (error) return next(error);

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    req.login(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.json({ user: { id: user._id, name: user.name, email: user.email } });
    });
  })(req, res, next);
}

export function logout(req, res, next) {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy(() => {
      res.clearCookie('linkvault.sid');
      return res.json({ message: 'Logged out' });
    });
  });
}

export function me(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(200).json({ user: null });
  }

  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
}
