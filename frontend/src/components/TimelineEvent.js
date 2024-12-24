import React from "react";

const TimelineEvent = ({ event }) => {
  const { type, timestamp } = event;

  const getIcon = () => {
    switch (type) {
      case "video_on":
        return "📹";
      case "audio_on":
        return "🎤";
      case "error":
        return "⚠️";
      case "join":
        return "➕";
      case "leave":
        return "➖";
      default:
        return "❓";
    }
  };

  return (
    <div className="timeline-event flex items-center">
      <span>{getIcon()}</span>
      <span className="ml-2">{timestamp}</span>
    </div>
  );
};

export default TimelineEvent;
