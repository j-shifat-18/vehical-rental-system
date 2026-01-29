import { Request, Response } from "express";
import { userServices } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers(req.body);

    res.status(200).json({
      success: true,
      message: "Data collected successfully",
      data: result,
    });
  } catch (err: any) {}
};

export const userControllers = {
    getAllUsers,
};
