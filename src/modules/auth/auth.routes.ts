import { Router } from "express";
import { authConrollers } from "./auth.controller";

const router = Router();

router.post("/signup" ,authConrollers.signup)

router.post("/signin",)

export const authRoutes = router;