import { Request, Response } from "express";
import { bookingServices } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

    // Validation
    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: "Missing required fields"
      });
    }

    const result = await bookingServices.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.message === "Vehicle not available") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available for booking",
        errors: "Vehicle unavailable"
      });
    }

    if (err.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist"
      });
    }

    if (err.message.includes("date")) {
      return res.status(400).json({
        success: false,
        message: err.message,
        errors: "Invalid date range"
      });
    }

    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        errors: "No user found in token"
      });
    }

    const result = await bookingServices.getBookings(user);

    const message = user.role === "admin" 
      ? "Bookings retrieved successfully" 
      : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message,
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

const updateBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        errors: "No user found in token"
      });
    }

    const result = await bookingServices.updateBooking(user, bookingId as string, req.body);
    
    let message = "Booking updated successfully";
    if (req.body.status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (req.body.status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (err: any) {
    if (err.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: "Booking does not exist"
      });
    }

    if (err.message === "Unauthorized to update this booking") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Cannot update other user's booking"
      });
    }

    if (err.message.includes("cannot be cancelled")) {
      return res.status(400).json({
        success: false,
        message: err.message,
        errors: "Invalid cancellation request"
      });
    }

    res.status(500).json({
      success: false,
      message: "Unexpected server errors",
      errors: "Internal Server Error",
    });
  }
};

export const bookingContollers = {
  createBooking,
  getBookings,
  updateBooking,
};