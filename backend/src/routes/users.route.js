
{/* User management routes */}

import express from "express";
import { sendOtp } from "../controllers/Otp.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);

export default router;
