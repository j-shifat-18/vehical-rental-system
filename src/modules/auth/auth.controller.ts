import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signup(req.body);

    res.status(201).json({
      success: true,
      message: "User Created Successfully.",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

const sign = async (req: Request, res: Response) => {
  try {
    const result = await authServices.signin(req.body);

    res.status(200).json({
      success: false,
      message: "login successful",
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
};
