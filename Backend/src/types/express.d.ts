import { JwtPayload } from "jsonwebtoken";
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // Adjust type based on your payload
    }
  }
}