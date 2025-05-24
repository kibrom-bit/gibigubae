import express from "express";
import { submitParticipant } from "../controllers/participantController.js";

const router = express.Router();

router.post("/submit", submitParticipant);

export default router;
