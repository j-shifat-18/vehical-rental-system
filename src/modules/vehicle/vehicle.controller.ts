import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getAllVehiles();

    res.status(200).json({
      success: true,
      message: "Data collected successfully",
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

export const vehicleControllers = {
  getAllVehicles,
};
