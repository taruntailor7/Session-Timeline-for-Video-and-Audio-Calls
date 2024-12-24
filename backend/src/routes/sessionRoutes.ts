import { Router } from "express";
import {
  startSession,
  addParticipant,
  leaveParticipant,
  logEvent,
  endSession,
  getSessions,
  getSession,
} from "../controllers/sessionController";

const router = Router();

router.get("/sessions", getSessions);
router.get("/sessions/:id", getSession);
router.post("/sessions/start", startSession);
router.post("/sessions/:meetingId/participant", addParticipant);
router.post("/sessions/:meetingId/leave-participant", leaveParticipant);
router.post('/sessions/:meetingId/log-event', logEvent);
router.post('/sessions/:meetingId/end', endSession);

export default router;
