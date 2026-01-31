import { Router } from "express";
import { vehicleControllers } from "./vehicle.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/" ,auth("admin") , vehicleControllers.createVehicle);
router.get("/" , vehicleControllers.getAllVehicles);
router.get("/:id" , vehicleControllers.getSigleVehicle);
router.put("/:id" ,auth("admin") ,vehicleControllers.updateVehicle);


export const vehicleRoutes = router ;