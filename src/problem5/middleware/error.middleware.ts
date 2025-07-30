import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  console.error('Error:', err);

  // Database errors
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      details: err.message,
    });
  }

  if (err.message.includes('SQLITE_ERROR')) {
    return res.status(500).json({
      success: false,
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
