import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../lib/api';
import './SchoolSelector.css';

export default function SchoolSelector() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      alert(location.state.message);
    }
    loadSchools();
  }, [location]);

  const loadSchools = async () => {
    try {
      const data = await studentAPI.getSchools();
      // Backend should already filter to only active schools
      // Trust the backend filtering - it filters by is_active = True and account_status != 'suspended'
      setSchools(data.schools || []);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = (schoolId) => {
    localStorage.setItem('selectedSchoolId', schoolId);
    navigate(`/schools/${schoolId}/signin`);
  };

  if (loading) {
    return (
      <div className="school-selector-page">
        <div className="school-selector-container">
          <div className="loading">Loading schools...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="school-selector-page">
      <div className="school-selector-container">
        <h1>Welcome to EigoKit</h1>
        <p className="subtitle">Please select your school</p>
        
        <div className="schools-grid">
          {schools.length > 0 ? (
            schools.map((school) => (
              <button
                key={school.id}
                className="school-card"
                onClick={() => handleSelectSchool(school.id)}
              >
                <h2>{school.name}</h2>
              </button>
            ))
          ) : (
            <p className="no-schools">No schools available</p>
          )}
        </div>
      </div>
    </div>
  );
}

