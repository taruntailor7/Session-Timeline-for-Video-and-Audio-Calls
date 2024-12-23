import { Request, Response } from "express";
import Session, { IError, IEvent } from "../models/sessionModel";

enum EventType {
  MIC = "mic",
  WEBCAM = "webcam",
  SCREEN_SHARE = "screenShare",
  SCREEN_SHARE_AUDIO = "screenShareAudio",
  ERROR = "errors",
}

// Fetch all sessions with pagination
export const getSessions = async (req: Request, res: Response) => {
  console.log("coming  here");
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
  const { meetingId } = req.body;

  try {
    const newSession = new Session({
      meetingId,
      start: new Date().toISOString(),
      uniqueParticipantsCount: 0,
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
export const addParticipant = async (req: Request, res: any) => {
  const { meetingId, participantId, name } = req.body;

  try {
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the participant in the session
    const existingParticipant = session.participantArray.find(
      (participant) => participant.participantId === participantId
    );

    const currentTimestamp = new Date().toISOString();

    if (existingParticipant) {
      // Participant already exists, update their timelog
      // Check if the participant has left, if they have, add a new entry in the timelog
      if (existingParticipant.timelog.length === 0) {
        // If no previous timelog or the last entry has an end time, add a new start
        existingParticipant.timelog.push({
          start: currentTimestamp,
          end: "",
        });
      }

      // Ensure the session count is updated for unique participants
      session.uniqueParticipantsCount = session.participantArray.filter(
        (participant) => participant.timelog.length > 0
      ).length;

      await session.save();
      return res.status(200).json(session);
    } else {
      // New participant joining the session, add them
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
        timelog: [
          {
            start: currentTimestamp, // Mark the current time as start time for joining
            end: "",
          },
        ],
      };

      session.participantArray.push(newParticipant);
      session.uniqueParticipantsCount += 1;

      await session.save();
      res.status(201).json(session);
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding participant", error });
  }
};

export const leaveParticipant = async (req: Request, res: any) => {
  const { meetingId, participantId } = req.body;

  try {
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the participant in the session
    const existingParticipant = session.participantArray.find(
      (participant) => participant.participantId === participantId
    );

    if (!existingParticipant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Find the last timelog entry for the participant and update the end time
    const lastTimelog =
      existingParticipant.timelog[existingParticipant.timelog.length - 1];

    if (lastTimelog && !lastTimelog.end) {
      // If the participant's last entry does not have an end time, update it
      lastTimelog.end = new Date().toISOString(); // Set the current timestamp as the end time
    } else {
      return res.status(400).json({
        message: "Participant is not in the meeting or already left.",
      });
    }

    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error leaving participant", error });
  }
};

// Log events for a participant
// export const logEvent = async (req: Request, res: any) => {
//   const { meetingId, participantId, eventType } = req.body;

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

export const logEvent = async (req: Request, res: any) => {
  const { meetingId, participantId, eventType, message } = req.body;
  const currentTimestamp = new Date().toISOString();

  // Validate eventType against the defined enum
  if (!Object.values(EventType).includes(eventType)) {
    return res.status(400).json({ message: "Invalid event type" });
  }

  // For errors eventType, message is required
  if (eventType === EventType.ERROR && !message) {
    return res
      .status(400)
      .json({ message: "Error message is required for 'errors' event type" });
  }

  try {
    // Find the session
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the participant in the session
    const participant = session.participantArray.find(
      (p) => p.participantId === participantId
    );

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Handle error events (errors are logged with a message)
    if (eventType === EventType.ERROR) {
      if (!message) {
        return res.status(400).json({
          message: "Error message is required for 'errors' event type",
        });
      }
      const error: IError = { start: currentTimestamp, message };
      participant.events.errors.push(error);
    }

    // Handle mic, webcam, screenShare, and screenShareAudio events
    if (
      eventType === EventType.MIC ||
      eventType === EventType.WEBCAM ||
      eventType === EventType.SCREEN_SHARE ||
      eventType === EventType.SCREEN_SHARE_AUDIO
    ) {
      // Handle mic, webcam, screenShare, and screenShareAudio events
      const eventArray = participant.events[
        eventType as keyof typeof participant.events
      ] as IEvent[];

      // Check if the last event is active (end is empty)
      const lastEvent = eventArray[eventArray.length - 1] as IEvent;

      if (lastEvent && lastEvent.end === "") {
        // If the last event is active (end is empty), we update its end time
        lastEvent.end = currentTimestamp;
      } else {
        // Otherwise, create a new event with start time and empty end
        const newEvent: IEvent = { start: currentTimestamp, end: "" };
        eventArray.push(newEvent);
      }
    }

    // Save the updated session
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error logging event", error });
  }
};

// End a session
export const endSession = async (req: Request, res: any) => {
  const { meetingId } = req.body;

  try {
    const session = await Session.findOne({ meetingId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.end = new Date().toISOString();
    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error ending session", error });
  }
};
