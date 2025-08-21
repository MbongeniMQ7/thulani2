// Queue data and constants
export const QUEUE_DATA = {
  overseer: {
    title: "Overseer's Office",
    subtitle: "Consultation available on Mondays between 14h00 - 16h00",
    timeRestriction: "This service is restricted to 10min to 12 queued persons.",
    currentQueue: 5,
    availability: {
      days: ["Monday"],
      hours: "14:00 - 16:00"
    },
    maxPersons: 12,
    sessionDuration: 10
  },
  pastor: {
    title: "Pastor's Office", 
    subtitle: "Consultation available Mon - Fri between 09h00 - 12h00",
    timeRestriction: "Consultation restricted to 10min",
    currentQueue: 20,
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: "09:00 - 12:00"
    },
    maxPersons: 50,
    sessionDuration: 10
  }
};

export const CONSULTATION_GUIDELINES = [
  "Arrive 5 minutes before your scheduled time",
  "Bring any relevant documents", 
  "Be prepared with your questions",
  "Respect the time limit for others waiting"
];

export const PASTOR_GUIDELINES = [
  "Available Monday through Friday",
  "Morning hours: 9:00 AM - 12:00 PM", 
  "10-minute consultations",
  "Spiritual guidance and counseling"
];

// Timer utility functions
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getInitialTimer = () => {
  // Default to 1 hour for demo purposes
  return 3600; // 1 hour in seconds
};
