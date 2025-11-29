import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global auth-ish error handling: if backend says this student is not allowed,
// clear local identifiers and send them back to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('studentId');
      localStorage.removeItem('classId');
      if (!window.location.pathname.startsWith('/signin')) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const studentAPI = {
  getSchools: async () => {
    const response = await api.get('/api/auth/schools');
    return response.data;
  },

  getSchoolPasswordIcons: async (schoolId) => {
    const response = await api.get(`/api/auth/schools/${schoolId}/password-icons`);
    return response.data;
  },

  register: async (name, iconSequence, classId) => {
    const response = await api.post('/api/auth/student/register', {
      name,
      icon_sequence: iconSequence,
      class_id: classId,
    });
    return response.data;
  },

  signIn: async (iconSequence, schoolId) => {
    const response = await api.post('/api/auth/student/signin', {
      icon_sequence: iconSequence,
    }, {
      params: { school_id: schoolId },
    });
    return response.data;
  },

  getProgress: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/progress`);
    return response.data;
  },

  getLeaderboard: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/leaderboard`);
    return response.data;
  },

  submitSurveyResponse: async (response) => {
    const apiResponse = await api.post('/api/surveys/responses', response);
    return apiResponse.data;
  },

  getSurveyQuestions: async (classId) => {
    const response = await api.get(`/api/surveys/questions/${classId}`);
    return response.data;
  },

  getGameConfig: async (studentId) => {
    const response = await api.get(`/api/games/config/${studentId}`);
    return response.data;
  },

  submitGameSession: async (studentId, session) => {
    const response = await api.post(`/api/students/${studentId}/game-session`, session);
    return response.data;
  },

  getVocabulary: async (studentId) => {
    const response = await api.get(`/api/content/vocabulary/${studentId}`);
    return response.data;
  },

  getGrammar: async (studentId) => {
    const response = await api.get(`/api/content/grammar/${studentId}`);
    return response.data;
  },

  evaluatePronunciation: async (studentId, audioBlob, referenceText) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('reference_text', referenceText);

    const response = await api.post(
      `/api/students/${studentId}/pronunciation-eval`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default api;

