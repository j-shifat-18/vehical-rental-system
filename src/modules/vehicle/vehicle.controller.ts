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

const getSigleVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await vehicleServices.getSigleVehicle(id as string);

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

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
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
const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("vehicleId :", id);
    const result = await vehicleServices.updateVehicle(id as string, req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle updated successfully",
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

const deleteVehicle = async (req: Request, res: Response) => {
  try {

    const {id} = req.params;

    const result = await vehicleServices.deleteVehicle(id as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "vehicle deleted successfully",
        data: result.rows,
      });
    }
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
  createVehicle,
  getSigleVehicle,
  updateVehicle,
  deleteVehicle,
};
