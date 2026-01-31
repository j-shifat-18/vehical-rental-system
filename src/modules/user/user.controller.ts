import { Request, Response } from "express";
import { userServices } from "./user.service";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
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

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user has active bookings
    const activeBookings = await userServices.checkActiveBookings(userId as string);
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active bookings",
        errors: "User has active bookings"
      });
    }

    const result = await userServices.deleteUser(userId as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User does not exist"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        errors: "No user found in token"
      });
    }

    const result = await userServices.updateUser(user, userId as string, req.body);
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User does not exist"
      });
    }
    
    if (err.message === "Unauthorized to update this user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Cannot update other user's profile"
      });
    }

    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

export const userControllers = {
  getAllUsers,
  deleteUser,
  updateUser,
};
