import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        [key: string]: any; // Include additional properties if needed
      };
    }
  }
}
