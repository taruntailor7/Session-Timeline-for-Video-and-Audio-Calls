import mongoose, { Document, Schema } from 'mongoose';

interface IEvent {
  start: string;
  end: string;
}

interface IError {
  start: string;
  message: string;
}

interface IParticipant {
  participantId: string;
  name: string;
  events: {
    mic: IEvent[];
    webcam: IEvent[];
    screenShare: IEvent[];
    screenShareAudio: IEvent[];
    errors: IError[];
  };
  timelog: IEvent[];
}

interface ISession extends Document {
  meetingId: string;
  start: string;
  end: string;
  uniqueParticipantsCount: number;
  participantArray: IParticipant[];
}

const EventSchema: Schema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const ErrorSchema: Schema = new Schema(
  {
    start: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const ParticipantSchema: Schema = new Schema(
  {
    participantId: { type: String, required: true },
    name: { type: String, required: true },
    events: {
      mic: [EventSchema],
      webcam: [EventSchema],
      screenShare: [EventSchema],
      screenShareAudio: [EventSchema],
      errors: [ErrorSchema],
    },
    timelog: [EventSchema],
  },
  { _id: false }
);

const SessionSchema: Schema = new Schema(
  {
    meetingId: { type: String, required: true, unique: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    uniqueParticipantsCount: { type: Number, required: true },
    participantArray: [ParticipantSchema],
  },
  { timestamps: true }
);

const Session = mongoose.model<ISession>('Session', SessionSchema);

export default Session;
