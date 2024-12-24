import React, { useEffect, useState } from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  MonitorUp, MonitorOff,
  Volume2, VolumeX,
  LogIn, LogOut,
  AlertTriangle
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchSessionDetails } from '../services/api';

const eventIcons = {
  "mic-start": <Mic className="w-4 h-4 text-green-600" />,
  "mic-end": <MicOff className="w-4 h-4 text-red-600" />,
  "webcam-start": <Video className="w-4 h-4 text-green-600" />,
  "webcam-end": <VideoOff className="w-4 h-4 text-red-600" />,
  "join": <LogIn className="w-4 h-4 text-blue-600" />,
  "leave": <LogOut className="w-4 h-4 text-gray-600" />,
  "errors-start": <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  "screenShare-start": <MonitorUp className="w-4 h-4 text-green-600" />,
  "screenShare-end": <MonitorOff className="w-4 h-4 text-red-600" />,
  "screenShareAudio-start": <Volume2 className="w-4 h-4 text-green-600" />,
  "screenShareAudio-end": <VolumeX className="w-4 h-4 text-red-600" />
};

const SessionTimeline = () => {
  const { id } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [timeMarkers, setTimeMarkers] = useState([]);

  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const data = await fetchSessionDetails(id);
        setSessionDetails(data);
        
        // Generate minute markers
        if (data.start && data.end) {
          const markers = [];
          const startTime = new Date(data.start);
          const endTime = new Date(data.end);
          const currentMarker = new Date(startTime);

          while (currentMarker <= endTime) {
            markers.push(new Date(currentMarker));
            currentMarker.setMinutes(currentMarker.getMinutes() + 1);
          }
          setTimeMarkers(markers);
        }
      } catch (error) {
        console.error("Error fetching session details:", error);
      }
    };

    getSessionDetails();
  }, [id]);

  const calculatePosition = (time) => {
    if (!sessionDetails?.start || !sessionDetails?.end) return 0;
    const start = new Date(sessionDetails.start);
    const end = new Date(sessionDetails.end);
    const current = new Date(time);
    const total = end - start;
    const position = current - start;
    return (position / total) * 100;
  };

  const renderTimeMarkers = () => (
    <div className="relative h-8 mb-4 border-b border-gray-200">
      {timeMarkers.map((time, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2"
          style={{ left: `${calculatePosition(time)}%` }}
        >
          <div className="h-2 w-0.5 bg-gray-300 mb-1" />
          <span className="text-xs text-gray-500">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );

  const renderTimelineEvent = (event, index) => {
    const position = calculatePosition(event.start);
  
    return (
      <div
        key={`${event.type}-${index}`}
        className="absolute transform -translate-x-1/2 group"
        style={{ left: `${position}%` }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 hover:border-blue-500 transition-colors duration-200">
          {eventIcons[event.type]}
        </div>
        {event.type === "errors-start" ? (
          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            <p>Error: {event.message}</p>
            <p className="text-gray-300">{new Date(event.start).toLocaleString()}</p>
          </div>
        ) : (
          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            {new Date(event.start).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const renderParticipantTimeline = (participant) => {
    const timeline = [];

    // Process join and leave events
    participant.timelog.forEach(timelog => {
      if (timelog.start) timeline.push({ type: 'join', start: timelog.start });
      if (timelog.end) timeline.push({ type: 'leave', start: timelog.end });
    });

    // Process other events
    Object.entries(participant.events).forEach(([eventType, events]) => {
      events.forEach(event => {
        // Handle "errors" type differently
        if (eventType === "errors") {
          timeline.push({
            type: `${eventType}-start`,
            start: event.start,
            message: event.message, // Include the message for errors
          });
        } else {
          // Handle other event types
          timeline.push({
            type: `${eventType}-start`,
            start: event.start,
          });
        }

        if (event.end && event.end !== "") {
          timeline.push({
            type: `${eventType}-end`,
            start: event.end
          });
        }
      });
    });

    timeline.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div className="mb-8" key={participant.participantId}>
        <div className="flex items-center mb-2">
          <h2 className="text-lg font-semibold">{participant.name}</h2>
          <span className="ml-2 text-sm text-gray-500">({participant.participantId})</span>
        </div>
        
        <div className="relative h-16">
          {/* Timeline base line */}
          <div className="absolute w-full h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2" />
          
          {/* Timeline events */}
          {timeline.map(renderTimelineEvent)}
        </div>
      </div>
    );
  };

  if (!sessionDetails) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Session Timeline</h1>
        {renderTimeMarkers()}
      </div>

      <div className="space-y-6">
        {sessionDetails.participantArray?.length > 0 ? (
          sessionDetails.participantArray.map(renderParticipantTimeline)
        ) : (
          <div className="text-gray-500">
            <p>No participants joined this session.</p>
            <p className="mt-2">Meeting ID: <strong>{sessionDetails.meetingId}</strong></p>
            <p>Start: <strong>{new Date(sessionDetails.start).toLocaleString()}</strong></p>
            <p>End: <strong>{new Date(sessionDetails.end).toLocaleString()}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTimeline;