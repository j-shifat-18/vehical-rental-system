import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getAllVehiles();

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: result,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
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
    const { vehicleId } = req.params;
    const result = await vehicleServices.getSigleVehicle(vehicleId as string);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result[0],
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
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    // Validation
    if (!vehicle_name || !type || !registration_number || !daily_rent_price || !availability_status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: "Missing required fields"
      });
    }

    if (!['car', 'bike', 'van', 'SUV'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be one of: car, bike, van, SUV",
        errors: "Invalid vehicle type"
      });
    }

    if (!['available', 'booked'].includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Availability status must be either 'available' or 'booked'",
        errors: "Invalid availability status"
      });
    }

    if (daily_rent_price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Daily rent price must be positive",
        errors: "Invalid price"
      });
    }

    const result = await vehicleServices.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        message: "Registration number already exists",
        errors: "Duplicate registration number"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};
const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await vehicleServices.updateVehicle(vehicleId as string, req.body);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist"
      });
    }

    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        message: "Registration number already exists",
        errors: "Duplicate registration number"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    // Check if vehicle has active bookings
    const activeBookings = await vehicleServices.checkActiveBookings(vehicleId as string);
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle with active bookings",
        errors: "Vehicle has active bookings"
      });
    }

    const result = await vehicleServices.deleteVehicle(vehicleId as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
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
  createVehicle,
  getSigleVehicle,
  updateVehicle,
  deleteVehicle,
};
