function productionMessage(statusCode) {
  if (statusCode === 400) return 'Invalid request';
  if (statusCode === 401) return 'Authentication required';
  if (statusCode === 403) return 'Access denied';
  if (statusCode === 404) return 'Route not found';
  if (statusCode === 429) return 'Too many requests';
  return 'Request failed';
}

export function notFound(_req, _res, next) {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || error.response?.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const detail = isProduction
    ? statusCode >= 500
      ? 'Unexpected server error'
      : productionMessage(statusCode)
    : error.response?.data?.message || error.message || 'Unexpected server error';

  res.status(statusCode).json({
    message: detail.startsWith('> Error:') ? detail : `> Error: ${detail}`
  });
}
