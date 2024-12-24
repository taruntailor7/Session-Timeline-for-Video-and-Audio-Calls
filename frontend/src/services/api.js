import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/sessions"; // Update with your backend URL

// Fetch all sessions
export const fetchSessions = async (page, limit) => {
  const response = await axios.get(`${API_BASE_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

// Fetch details of a specific session
export const fetchSessionDetails = async (id) => {
  console.log('getSession id', id);
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Start a new session
export const startSession = async (sessionData) => {
  const response = await axios.post(`${API_BASE_URL}/start`, sessionData);
  return response.data;
};

// Add a participant to a session
export const addParticipant = async (meetingId, participantData) => {
  const response = await axios.post(
    `${API_BASE_URL}/${meetingId}/participant`,
    participantData
  );
  return response.data;
};

// Remove a participant from a session
export const leaveParticipant = async (meetingId, participantData) => {
  const response = await axios.post(
    `${API_BASE_URL}/${meetingId}/leave-participant`,
    participantData
  );
  return response.data;
};

// Log an event in a session
export const logEvent = async (meetingId, eventData) => {
  const response = await axios.post(
    `${API_BASE_URL}/${meetingId}/log-event`,
    eventData
  );
  return response.data;
};

// End a session
export const endSession = async (meetingId) => {
  const response = await axios.post(`${API_BASE_URL}/${meetingId}/end`);
  return response.data;
};
