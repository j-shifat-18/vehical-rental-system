import { Router } from "express";
import { bookingContollers } from "./booking.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/" ,auth("admin" , "customer") , bookingContollers.createBooking);


export const bookingRoutes = router;