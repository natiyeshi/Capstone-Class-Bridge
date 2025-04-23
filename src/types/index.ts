import { Request } from "express";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  result: T | null;
};


declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
    }
  }
}
