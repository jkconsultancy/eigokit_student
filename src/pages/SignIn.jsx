import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import IconSelector from '../components/IconSelector';
import { studentAPI } from '../lib/api';
import './SignIn.css';

export default function SignIn() {
  const { schoolId: schoolIdParam } = useParams();
  const [iconSequence, setIconSequence] = useState([]);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingIcons, setLoadingIcons] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      alert(location.state.message);
    }

    // Get school ID from URL params first, then fallback to localStorage
    const selectedSchoolId = schoolIdParam || localStorage.getItem('selectedSchoolId');
    if (!selectedSchoolId) {
      navigate('/');
      return;
    }

    // Update localStorage to match URL
    localStorage.setItem('selectedSchoolId', selectedSchoolId);
    setSchoolId(selectedSchoolId);
    loadSchoolIcons(selectedSchoolId);
  }, [schoolIdParam, location, navigate]);

  const loadSchoolIcons = async (schoolId) => {
    try {
      const data = await studentAPI.getSchoolPasswordIcons(schoolId);
      setAvailableIcons(data.icons || []);
      setSchoolName(data.school_name || '');
    } catch (err) {
      console.error('Failed to load school icons:', err);
      setError('Failed to load school information');
    } finally {
      setLoadingIcons(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (iconSequence.length !== 5) {
      setError('Please select your 5 icons in the correct order');
      return;
    }

    if (!schoolId) {
      setError('School not selected');
      return;
    }

    setLoading(true);
    try {
      const result = await studentAPI.signIn(iconSequence, schoolId);
      localStorage.setItem('studentId', result.student_id);
      localStorage.setItem('classId', result.class_id);
      
      // Check if user has skipped survey in this session
      const hasSkippedSurvey = sessionStorage.getItem('surveySkipped') === 'true';
      
      // Check for open surveys and redirect if available (unless skipped this session)
      if (!hasSkippedSurvey) {
        try {
          const openSurveysData = await studentAPI.getOpenSurveys(result.student_id);
          if (openSurveysData.count > 0) {
            navigate('/surveys');
            return;
          }
        } catch (surveyError) {
          console.error('Failed to check for surveys:', surveyError);
          // Continue to dashboard if survey check fails
        }
      }
      
      // Navigate to dashboard if no surveys or survey was skipped
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Sign in failed. Please check your icon sequence.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingIcons) {
    return (
      <div className="signin-page">
        <div className="signin-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h1>Student Sign In</h1>
        {schoolName && <p className="school-name">{schoolName}</p>}
        <p className="subtitle">Select your 5 icons in order</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <IconSelector
            selectedIcons={iconSequence}
            onSelect={setIconSequence}
            maxSelections={5}
            availableIcons={availableIcons}
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="register-link">
          Not registered? <a href="/register">Register here</a>
        </p>
        <p className="forgot-password-note">
          If you forget your icon code, please ask your teacher to reset your registration.
        </p>
        <button
          className="change-school-button"
          onClick={() => {
            localStorage.removeItem('selectedSchoolId');
            navigate('/', { replace: true });
          }}
        >
          Change School
        </button>
      </div>
    </div>
  );
}

