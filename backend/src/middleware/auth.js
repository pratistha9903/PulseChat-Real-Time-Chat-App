import { verifyToken } from '../utils/auth.js';
import { getUserById } from '../db/services.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export async function socketAuthenticate(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return next(new Error('User not found'));
    socket.data.user = user;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
