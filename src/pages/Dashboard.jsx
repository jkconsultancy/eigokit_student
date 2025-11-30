import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [openSurveysCount, setOpenSurveysCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingSurveys, setCheckingSurveys] = useState(true);
  const studentId = localStorage.getItem('studentId');
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  const loadData = async () => {
    if (!studentId) {
      const selectedSchoolId = localStorage.getItem('selectedSchoolId');
      const target = selectedSchoolId
        ? `/schools/${selectedSchoolId}/signin`
        : '/';
      window.location.href = target;
      return;
    }

    try {
      // Check for open surveys (but don't force redirect - just show badge)
      const openSurveysData = await studentAPI.getOpenSurveys(studentId);
      setOpenSurveysCount(openSurveysData.count || 0);
      setCheckingSurveys(false);
      
      const [progressData, leaderboardData] = await Promise.all([
        studentAPI.getProgress(studentId),
        studentAPI.getLeaderboard(studentId),
      ]);
      setProgress(progressData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setCheckingSurveys(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId, navigate]);

  // Refresh data when navigating to dashboard from another page (e.g., after playing a game)
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    const currentPathname = location.pathname;
    
    // Only refresh if we're on dashboard and came from a different page
    if (currentPathname === '/dashboard' && prevPathname !== '/dashboard' && studentId && !loading) {
      loadData();
    }
    
    prevPathnameRef.current = currentPathname;
  }, [location.pathname, studentId]);

  // Load open surveys count for badge (after initial check)
  useEffect(() => {
    if (!studentId || checkingSurveys) return;
    
    const loadSurveyCount = async () => {
      try {
        const openSurveysData = await studentAPI.getOpenSurveys(studentId);
        setOpenSurveysCount(openSurveysData.count || 0);
      } catch (error) {
        console.error('Failed to load survey count:', error);
      }
    };
    
    loadSurveyCount();
  }, [studentId, checkingSurveys]);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('classId');
    const selectedSchoolId = localStorage.getItem('selectedSchoolId');
    const target = selectedSchoolId
      ? `/schools/${selectedSchoolId}/signin`
      : '/';
    window.location.href = target;
  };

  if (loading || checkingSurveys) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{progress?.student_name ? `${progress.student_name}'s Dashboard` : 'My Dashboard'}</h1>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        <div className="progress-section">
          <h2>My Progress</h2>
          <div className="progress-cards">
            <div className="progress-card">
              <h3>Vocabulary</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress?.vocabulary_progress || 0}%` }}
                />
              </div>
              <p>{Math.round(progress?.vocabulary_progress || 0)}%</p>
            </div>

            <div className="progress-card">
              <h3>Grammar</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress?.grammar_progress || 0}%` }}
                />
              </div>
              <p>{Math.round(progress?.grammar_progress || 0)}%</p>
            </div>

            <div className="progress-card">
              <h3>Streak</h3>
              <div className="streak-display">
                <span className="streak-number">{progress?.streak_days || 0}</span>
                <span className="streak-label">days</span>
              </div>
            </div>

            <div className="progress-card">
              <h3>Total Points</h3>
              <div className="points-display">
                <span className="points-number">{progress?.total_points || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {leaderboard && (
          <div className="leaderboard-section">
            <h2>My Position</h2>
            <div className="leaderboard-card">
              <div className="position-display">
                <span className="position-number">{leaderboard.position}</span>
                <span className="position-label">of {leaderboard.total_students}</span>
              </div>
              <div className="category-positions">
                <div className="category-item">
                  <span>Vocabulary:</span>
                  <span>#{leaderboard.categories.vocabulary}</span>
                </div>
                <div className="category-item">
                  <span>Grammar:</span>
                  <span>#{leaderboard.categories.grammar}</span>
                </div>
                <div className="category-item">
                  <span>Game Points:</span>
                  <span>#{leaderboard.categories.game_points}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {progress?.badges && progress.badges.length > 0 && (
          <div className="badges-section">
            <h2>My Badges</h2>
            <div className="badges-grid">
              {progress.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  🏆 {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions-section">
          <Link to="/games" className="action-button primary">
            Play Games
          </Link>
          <Link to="/surveys" className="action-button secondary survey-button">
            Take Survey
            {openSurveysCount > 0 && (
              <span className="survey-badge">{openSurveysCount}</span>
            )}
          </Link>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}

