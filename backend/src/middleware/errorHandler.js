export function notFound(_req, res) {
  return res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }

  return res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
}
