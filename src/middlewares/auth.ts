import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;

     

      if (!header) {
        return res.status(401).json({ message: "Unauthorized access" });
      }

      const bearer = header.split(" ")[0] as string;

      if(!bearer || bearer !== "Bearer"){
        return res.status(401).json({ message: "Unauthorized access" });
      }
      const token = header.split(" ")[1] as string;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
      }

      const decoded = jwt.verify(
        token,
        config.jwtSecret as string,
      ) as JwtPayload;

      req.user = decoded;


      //   console.log(decoded);

      if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(401).json({
          error: "unauthorized!!!",
        });
      }

      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

export default auth;
