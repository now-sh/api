import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      // Authentication properties
      user?: string;  // User email from JWT
      userId?: string;  // MongoDB ObjectId as string
      isAuthenticated?: boolean;
      
      // Token payload if needed
      tokenPayload?: JwtPayload & { email: string };
      
      // Raw token for downstream use
      token?: string;
    }
    
    export interface Response {
      // Custom response methods if needed
    }
  }
}

// Ensure this file is treated as a module
export {};