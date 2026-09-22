import { Router } from "express";
import { bookingContollers } from "./booking.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/" ,auth("admin" , "customer") , bookingContollers.getBookings);
router.post("/" ,auth("admin" , "customer") , bookingContollers.createBooking);
router.put("/:bookingId" ,auth("admin" , "customer") , bookingContollers.updateBooking);

export const bookingRoutes = router;