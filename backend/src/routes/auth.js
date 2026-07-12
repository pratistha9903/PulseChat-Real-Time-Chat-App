import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  createUser,
  getUserByUsername,
  getUserByEmail,
} from '../db/services.js';
import { signToken } from '../utils/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username?.trim() || username.length < 3) {
      return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return res.status(400).json({ success: false, error: 'Username can only contain letters, numbers, and underscores' });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (await getUserByUsername(trimmedUsername)) {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }
    if (await getUserByEmail(email.trim().toLowerCase())) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({
      username: trimmedUsername,
      email: email.trim().toLowerCase(),
      passwordHash,
      displayName: displayName?.trim() || username.trim(),
    });

    const token = signToken(user);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const user = await getUserByUsername(username.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const formatted = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
      createdAt: user.createdAt,
    };

    const token = signToken(formatted);
    res.json({ success: true, data: { user: formatted, token } });
  } catch (error) {
    next(error);
  }
});

export default router;
