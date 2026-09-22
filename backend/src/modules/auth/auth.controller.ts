import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: "Missing required fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
        errors: "Invalid password length"
      });
    }

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'customer'",
        errors: "Invalid role"
      });
    }

    const result = await authServices.signup(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: "Duplicate email"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: "Missing credentials"
      });
    }

    const result = await authServices.signin(req.body);

    if (result === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        errors: "Authentication failed"
      });
    }

    if (result === false) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        errors: "Authentication failed"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

export const authConrollers = {
  signup,
  signin
};
