import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../lib/api';
import './Surveys.css';

export default function Surveys() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const studentId = localStorage.getItem('studentId');
  const classId = localStorage.getItem('classId');

  useEffect(() => {
    if (!studentId || !classId) {
      window.location.href = '/signin';
      return;
    }

    const loadQuestions = async () => {
      try {
        const data = await studentAPI.getSurveyQuestions(classId);
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [studentId, classId]);

  const handleResponse = (questionId, response) => {
    setResponses({ ...responses, [questionId]: response });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const lessonId = `lesson_${Date.now()}`;
      for (const [questionId, response] of Object.entries(responses)) {
        await studentAPI.submitSurveyResponse({
          student_id: studentId,
          lesson_id: lessonId,
          question_id: questionId,
          response,
        });
      }
      alert('Survey submitted! Thank you!');
      window.location.href = '/dashboard';
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to submit survey';
      console.error('Failed to submit survey:', error);
      alert(`Failed to submit survey: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="surveys-loading">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="surveys-page">
        <div className="surveys-container">
          <h1>No Surveys Available</h1>
          <p>There are no surveys available at this time.</p>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="surveys-page">
      <div className="surveys-container">
        <h1>Post-Lesson Survey</h1>
        <p className="subtitle">Help us understand how the lesson went!</p>

        <div className="questions-list">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <h3>{question.question_text}</h3>
              {question.question_text_jp && (
                <p className="question-jp">{question.question_text_jp}</p>
              )}

              {question.question_type === 'emoji_scale' && (
                <div className="emoji-scale">
                  {['😞', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
                    <button
                      key={index}
                      className={`emoji-button ${responses[question.id] === index ? 'selected' : ''}`}
                      onClick={() => handleResponse(question.id, index)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'multiple_choice' && (
                <div className="multiple-choice">
                  {question.options?.map((option, index) => (
                    <button
                      key={index}
                      className={`choice-button ${responses[question.id] === option ? 'selected' : ''}`}
                      onClick={() => handleResponse(question.id, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'yes_no' && (
                <div className="yes-no">
                  <button
                    className={`yes-no-button ${responses[question.id] === 'yes' ? 'selected' : ''}`}
                    onClick={() => handleResponse(question.id, 'yes')}
                  >
                    Yes
                  </button>
                  <button
                    className={`yes-no-button ${responses[question.id] === 'no' ? 'selected' : ''}`}
                    onClick={() => handleResponse(question.id, 'no')}
                  >
                    No
                  </button>
                </div>
              )}

              {question.question_type === 'short_answer' && (
                <textarea
                  className="short-answer"
                  placeholder="Type your answer here..."
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="survey-actions">
          <button
            onClick={handleSubmit}
            className="submit-survey-button"
            disabled={submitting || Object.keys(responses).length === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
          </button>
          <Link to="/dashboard" className="skip-link">Skip</Link>
        </div>
      </div>
    </div>
  );
}

