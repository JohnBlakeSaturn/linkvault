function createRateLimiter({ windowMs, limit, scope }) {
  const store = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${scope}:${req.ip}`;
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    entry.count += 1;
    return next();
  };
}

module.exports = {
  createRateLimiter,
};
