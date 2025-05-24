import express from "express";
import {
  authenticateAdmin,
  getParticipantsData,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/auth", authenticateAdmin);
router.get("/data", getParticipantsData);

export default router;
