import { Router } from "express";
import { vehicleControllers } from "./vehicle.controller";

const router = Router();

router.get("/" ,vehicleControllers.getAllVehicles);

export const vehicleRoutes = router ;