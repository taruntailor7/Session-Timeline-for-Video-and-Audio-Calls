import { Request, Response } from "express";
import Session from "../models/sessionModel";

// Fetch all sessions with pagination
export const getSessions = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const sessions = await Session.find()
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await Session.countDocuments();
    res.status(200).json({
      sessions,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions", error });
  }
};

// Start a new session
export const startSession = async (req: Request, res: Response) => {
  const { meetingId, start, uniqueParticipantsCount } = req.body;

  try {
    const newSession = new Session({
      meetingId,
      start,
      uniqueParticipantsCount,
      end: "", // To be updated when session ends
      participantArray: [],
    });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ message: "Error starting session", error });
  }
};

// Add a participant to a session
export const addParticipant = async (req: Request, res: Response) => {
  const { meetingId, participantId, name } = req.body;

  try {
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const newParticipant = {
      participantId,
      name,
      events: {
        mic: [],
        webcam: [],
        screenShare: [],
        screenShareAudio: [],
        errors: [],
      },
      timelog: [],
    };

    session.participantArray.push(newParticipant);
    session.uniqueParticipantsCount += 1;

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error adding participant", error });
  }
};

// Log events for a participant
// export const logEvent = async (req: Request, res: Response) => {
//   const { meetingId, participantId, eventType, start, end, message } = req.body;

//   try {
//     const session = await Session.findOne({ meetingId });

//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     const participant = session.participantArray.find(
//       (p) => p.participantId === participantId
//     );

//     if (!participant) {
//       return res.status(404).json({ message: "Participant not found" });
//     }

//     const event = { start, end };

//     if (
//       eventType === "mic" ||
//       eventType === "webcam" ||
//       eventType === "screenShare" ||
//       eventType === "screenShareAudio"
//     ) {
//       participant.events[eventType].push(event);
//     } else if (eventType === "errors") {
//       const error = { start, message };
//       participant.events.errors.push(error);
//     }

//     await session.save();
//     res.status(200).json(session);
//   } catch (error) {
//     res.status(500).json({ message: "Error logging event", error });
//   }
// };

// End a session
export const endSession = async (req: Request, res: Response) => {
  const { meetingId, end } = req.body;

  try {
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.end = end;
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error ending session", error });
  }
};

