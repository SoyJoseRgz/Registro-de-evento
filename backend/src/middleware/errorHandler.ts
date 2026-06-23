import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _: Request, res: Response, __: NextFunction): void {
  console.error('Error:', err.message);
  
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }
  
  if (err.name === 'NotFoundError') {
    res.status(404).json({ error: err.message });
    return;
  }
  
  res.status(500).json({ error: 'Internal server error' });
}
