import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;

      if (!header) {
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized access",
          errors: "Missing authorization header"
        });
      }

      const bearer = header.split(" ")[0] as string;

      if(!bearer || bearer !== "Bearer"){
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized access",
          errors: "Invalid authorization format"
        });
      }
      
      const token = header.split(" ")[1] as string;

      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: "Unauthorized access",
          errors: "Missing token"
        });
      }

      const decoded = jwt.verify(
        token,
        config.jwtSecret as string,
      ) as JwtPayload;

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "Insufficient permissions"
        });
      }

      next();
    } catch (err: any) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
          errors: "Invalid token"
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
          errors: "Token expired"
        });
      }

      res.status(500).json({
        success: false,
        message: "Unexpected server errors",
        errors: "Internal Server Error"
      });
    }
  };
};

export default auth;
