import React, { useState, useEffect } from "react";
import { fetchSessionDetails } from "../services/api";
import { useParams } from "react-router-dom";

// const eventIcons = {
//   mic: "🎤",
//   webcam: "📹",
//   screenShare: "🖥️",
//   screenShareAudio: "🔊",
//   errors: "⚠️",
// };

const eventIcons = {
  "mic-start": "🎤", // Mic unmuted
  "mic-end": "🎤", // Mic muted
  "webcam-start": "📷", // Webcam turned on
  "webcam-end": "📷", // Webcam turned off
  join: "👥", // User joined
  leave: "👋", // User left
  errors: "⚠️",
  "screenShare-start": "🖥️",
  "screenShare-end": "🖥️",
  "screenShareAudio-start": "🔊",
  "screenShareAudio-end": "🔊",
};

const SessionTimeline = () => {
  const { id } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const data = await fetchSessionDetails(id);
        setSessionDetails(data);
      } catch (error) {
        console.error("Error fetching session details:", error);
      }
    };

    getSessionDetails();
  }, [id]);

  if (!sessionDetails) {
    return <p>Loading...</p>;
  }

  const renderParticipantTimeline = (participant) => {
    // Initialize an array for the timeline
    const timeline = [];

    // Process join and leave times from timelog
    for (let i = 0; i < participant.timelog.length; i++) {
      const timelog = participant.timelog[i];

      // If start time exists, it's a join event
      if (timelog.start) {
        timeline.push({ type: "join", start: timelog.start });
      }

      // If end time exists, it's a leave event
      if (timelog.end) {
        timeline.push({ type: "leave", start: timelog.end });
      }
    }

    // Process the events like mic, webcam, etc.
    Object.entries(participant.events).forEach(([eventType, events]) => {
      events.forEach((event) => {
        // For events that have start and end times (e.g., mic, webcam), treat both as separate events
        if (event.start) {
          timeline.push({
            ...event,
            type: `${eventType}-start`,
            start: event.start,
          });
        }
        if (event.end) {
          timeline.push({ type: `${eventType}-end`, start: event.end });
        }
      });
    });

    // Sort all events by the start time
    timeline.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div className="mb-4" key={participant.participantId}>
        <h2 className="font-bold text-lg">{participant.name}</h2>
        <div className="flex flex-col gap-2">
          {timeline.length === 0 ? (
            <div className="inline-block bg-gray-200 text-sm px-2 py-1 rounded m-1">
              <span>No events available</span>
            </div>
          ) : (
            timeline.map((event, index) => (
              <div
                key={`${event.type}-${index}`}
                className="inline-block bg-gray-200 text-sm px-2 py-1 rounded m-1"
              >
                {/* Show event icon */}
                <span>
                  {eventIcons[event.type] ||
                    eventIcons[
                      event.type.replace("-start", "").replace("-end", "")
                    ] ||
                    event.type}
                </span>

                {/* Show 'Start' or 'End' */}
                <span className="ml-2 text-sm text-gray-600">
                  {event.type === "join"
                    ? "Start"
                    : event.type === "leave"
                    ? "End"
                    : event.type.includes("start")
                    ? "Start"
                    : "End"}
                </span>

                {/* Display time */}
                <span className="ml-2">
                  Time: {new Date(event.start).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Session Timeline</h1>
      <div>
        {sessionDetails.participantArray &&
        sessionDetails.participantArray.length > 0 ? (
          sessionDetails.participantArray.map(renderParticipantTimeline)
        ) : (
          <div>
            <p>No participants joined this session.</p>
            <p>
              Meeting ID: <strong>{sessionDetails.meetingId}</strong>
            </p>
            <p>
              Start:{" "}
              <strong>{new Date(sessionDetails.start).toLocaleString()}</strong>
            </p>
            <p>
              End:{" "}
              <strong>{new Date(sessionDetails.end).toLocaleString()}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTimeline;