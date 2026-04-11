export const handleControllerError = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message });
  }

  if (error.name === 'ConflictError') {
    return res.status(409).json({ error: error.message });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: error.message });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({ error: error.message });
  }

  return res.status(500).json({
    error: error.message || 'Error interno del servidor'
  });
};
