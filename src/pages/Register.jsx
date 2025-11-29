import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IconSelector from '../components/IconSelector';
import { studentAPI } from '../lib/api';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [iconSequence, setIconSequence] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!classId.trim()) {
      setError('Please enter your class ID');
      return;
    }

    if (iconSequence.length !== 5) {
      setError('Please select exactly 5 icons');
      return;
    }

    setLoading(true);
    try {
      await studentAPI.register(name, iconSequence, classId);
      navigate('/', { state: { message: 'Registration successful! Please select your school to sign in.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Student Registration</h1>
        <p className="subtitle">Create your account to start learning!</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="classId">Class ID</label>
            <input
              id="classId"
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Enter your class ID"
              required
            />
          </div>

          <IconSelector
            selectedIcons={iconSequence}
            onSelect={setIconSequence}
            maxSelections={5}
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="login-link">
          Already registered? <a href="/">Select your school to sign in</a>
        </p>
      </div>
    </div>
  );
}

