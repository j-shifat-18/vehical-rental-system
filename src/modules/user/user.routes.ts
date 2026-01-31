import { Router } from "express";
import { userControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/" ,auth("admin"), userControllers.getAllUsers);
// router.put("/:id" ,auth("admin"), userControllers.deleteUser);
router.delete("/:id" ,auth("admin"), userControllers.deleteUser);


export const userRoutes = router;