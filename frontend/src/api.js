import axios from 'axios';

// Create a centralized Axios instance
const API = axios.create({
  // Point this to Person 1's FastAPI server port (usually 8000)
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor just in case you need to debug network errors during the hackathon
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 Backend API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default API;