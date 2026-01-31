import { Request, Response } from "express";
import { bookingServices } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Booking Created Successfully.",
      data: result.rows,
    });
  } catch (err: any) {
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

    if (user) {
      const result = await bookingServices.getBookings(user);

      res.status(200).json({
      success: true,
      message: "Data collected successfully",
      data: result,
    });
    }

    res.status(200).json({
      success: true,
      message: "user not found",
      data: [],
    });

  } catch (err: any) {
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
};
