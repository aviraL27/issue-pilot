export function notFound(req, _res, next) {
  const error = new Error(`> Error: route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || error.response?.status || 500;
  const detail = error.response?.data?.message || error.message || 'Unexpected server error';
  res.status(statusCode).json({
    message: detail.startsWith('> Error:') ? detail : `> Error: ${detail}`
  });
}
