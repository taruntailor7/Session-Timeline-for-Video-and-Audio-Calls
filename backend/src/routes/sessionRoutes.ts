import { Router } from "express";
import {
  startSession,
  addParticipant,
  // logEvent,
  endSession,
  getSessions,
} from "../controllers/sessionController";

const router = Router();

router.get("/sessions", getSessions);
router.post("/sessions/start", startSession);
// router.post("/sessions/:meetingId/participant", addParticipant);
// router.post('/sessions/:meetingId/log-event', logEvent);
// router.post('/sessions/:meetingId/end', endSession);

export default router;
