import { JwtPayload } from "jsonwebtoken";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Adjust type based on your payload
    }
  }
}