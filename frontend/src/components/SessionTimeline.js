import React, { useEffect, useState } from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  MonitorUp, MonitorOff,
  Volume2, VolumeX,
  LogIn, LogOut,
  AlertTriangle,
  ChevronRight,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSessionDetails } from '../services/api';

const eventIcons = {
  "mic-start": <Mic className="w-4 h-4 text-white" />,
  "mic-end": <MicOff className="w-4 h-4 text-white" />,
  "webcam-start": <Video className="w-4 h-4 text-white" />,
  "webcam-end": <VideoOff className="w-4 h-4 text-white" />,
  "join": <LogIn className="w-4 h-4 text-white" />,
  "leave": <LogOut className="w-4 h-4 text-white" />,
  "errors-start": <AlertTriangle className="w-4 h-4 text-white" />,
  "screenShare-start": <MonitorUp className="w-4 h-4 text-white" />,
  "screenShare-end": <MonitorOff className="w-4 h-4 text-white" />,
  "screenShareAudio-start": <Volume2 className="w-4 h-4 text-white" />,
  "screenShareAudio-end": <VolumeX className="w-4 h-4 text-white" />
};

const SessionTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [timeMarkers, setTimeMarkers] = useState([]);
  const [showParticipantTimeline, setShowParticipantTimeline] = useState(true);

  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const data = await fetchSessionDetails(id);
        setSessionDetails(data);
        
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
    <div className="relative h-8 border-b border-gray-700">
      {timeMarkers.map((time, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2"
          style={{ left: `${calculatePosition(time)}%` }}
        >
          <span className="text-xs text-gray-500">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );

  const renderTimelineSegments = (timeline) => {
    let segments = [];
    let currentSegment = [];
    
    timeline.forEach((event, index) => {
      if (event.type === 'join') {
        currentSegment = [event];
      } else if (event.type === 'leave' && currentSegment.length > 0) {
        currentSegment.push(event);
        segments.push(currentSegment);
        currentSegment = [];
      } else if (currentSegment.length > 0) {
        currentSegment.push(event);
      }
    });

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments.map((segment, segmentIndex) => {
      const startPos = calculatePosition(segment[0].start);
      const endPos = calculatePosition(segment[segment.length - 1].start);
      
      return (
        <React.Fragment key={segmentIndex}>
          <div 
            className="absolute h-0.5 bg-[#5568FE]"
            style={{
              left: `${startPos}%`,
              width: `${endPos - startPos}%`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          {segment.map((event, eventIndex) => renderTimelineEvent(event, `${segmentIndex}-${eventIndex}`))}
        </React.Fragment>
      );
    });
  };

  const renderTimelineEvent = (event, index) => {
    const position = calculatePosition(event.start);
  
    return (
      <div
        key={`${event.type}-${index}`}
        className="absolute transform -translate-x-1/2 group z-10"
        style={{ left: `${position}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
          event.type.includes('end') ? 'bg-gray-800' : 'bg-[#5568FE]'
        } border-2 border-black hover:border-[#5568FE] transition-colors duration-200`}>
          {eventIcons[event.type]}
        </div>
        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          {event.type === "errors-start" ? (
            <>
              <p>Error: {event.message}</p>
              <p className="text-gray-400">{new Date(event.start).toLocaleString()}</p>
            </>
          ) : (
            new Date(event.start).toLocaleString()
          )}
        </div>
      </div>
    );
  };

  const renderParticipantTimeline = (participant, index) => {
    const timeline = [];

    participant.timelog.forEach(timelog => {
      if (timelog.start) timeline.push({ type: 'join', start: timelog.start });
      if (timelog.end) timeline.push({ type: 'leave', start: timelog.end });
    });

    Object.entries(participant.events).forEach(([eventType, events]) => {
      events.forEach(event => {
        if (eventType === "errors") {
          timeline.push({
            type: `${eventType}-start`,
            start: event.start,
            message: event.message,
          });
        } else {
          timeline.push({ type: `${eventType}-start`, start: event.start });
          if (event.end && event.end !== "") {
            timeline.push({ type: `${eventType}-end`, start: event.end });
          }
        }
      });
    });

    timeline.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
      <div key={participant.participantId} className={`relative ${index > 0 ? 'border-t border-gray-800 pt-8' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white text-sm font-medium">{participant.name} ({participant.participantId})</h2>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(participant.timelog[0]?.start).toLocaleDateString()} | Duration {20} Mins
            </div>
          </div>
          <button className="flex items-center text-[#5568FE] text-sm hover:text-opacity-80">
            View details <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="relative h-16">
          {renderTimelineSegments(timeline)}
        </div>
      </div>
    );
  };

  if (!sessionDetails) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="p-6 bg-black min-h-screen">
      <button
        className="flex items-center text-[#5568FE] text-sm mb-6 hover:text-opacity-80"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Sessions
      </button>
      
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center text-white">
          <FileText className="w-5 h-5 mr-2" />
          <h1 className="text-lg font-medium">Participants wise Session Timeline</h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-2">Show participant timeline</span>
          <button 
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
              showParticipantTimeline ? 'bg-[#5568FE]' : 'bg-gray-800'
            }`}
            onClick={() => setShowParticipantTimeline(!showParticipantTimeline)}
          >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
              showParticipantTimeline ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {renderTimeMarkers()}

      <div className="mt-8 space-y-8">
        {sessionDetails.participantArray?.length > 0 ? (
          sessionDetails.participantArray.map(renderParticipantTimeline)
        ) : (
          <div className="text-gray-500">No participants joined this session.</div>
        )}
      </div>
    </div>
  );
};

export default SessionTimeline;
