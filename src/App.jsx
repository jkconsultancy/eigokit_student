import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import SchoolSelector from './pages/SchoolSelector';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import Surveys from './pages/Surveys';
import { loadTheme } from './lib/theme';
import './App.css';

function FallbackRoute() {
  const studentId = localStorage.getItem('studentId');
  const selectedSchoolId = localStorage.getItem('selectedSchoolId');

  if (studentId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (selectedSchoolId) {
    return <Navigate to={`/schools/${selectedSchoolId}/signin`} replace />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  useEffect(() => {
    // Load theme from school (in production, get schoolId from user context)
    // For now, using a default or from localStorage
    const schoolId = localStorage.getItem('selectedSchoolId') || localStorage.getItem('schoolId') || 'default';
    loadTheme(schoolId);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SchoolSelector />} />
        <Route path="/register" element={<Register />} />
        <Route path="/schools/:schoolId/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games" element={<Games />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
