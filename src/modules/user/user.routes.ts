import { Router } from "express";
import { userControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/" ,auth("admin"), userControllers.getAllUsers);

export const userRoutes = router;