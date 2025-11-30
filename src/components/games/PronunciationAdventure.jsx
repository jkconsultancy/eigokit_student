import { useState, useEffect } from 'react';
import { studentAPI } from '../../lib/api';
import './Game.css';

export default function PronunciationAdventure({ config, onComplete, onBack }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const vocab = config?.vocabulary || [];
    if (vocab.length > 0) {
      setCurrentIndex(0);
      setCurrentWord(vocab[0]);
      setError(null);
    } else {
      setError('No vocabulary available. Please ask your teacher to add vocabulary words.');
    }
  }, [config]);

  const handleRecord = async () => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        setError('Student not signed in. Please sign in again.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone access is not supported in this browser.');
        return;
      }

      setIsRecording(true);
      setFeedback(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const result = await studentAPI.evaluatePronunciation(
            studentId,
            blob,
            currentWord.english_word
          );

          setAttempts((prev) => prev + 1);
          setScore((prev) => prev + Math.round(result.similarity_score / 10));

          setFeedback(
            `Heard: "${result.transcript || '...' }" · Match: ${result.similarity_score.toFixed(
              1
            )}%`
          );
        } catch (err) {
          console.error('Pronunciation evaluation failed:', err);
          const message =
            err?.response?.data?.detail ||
            'Failed to evaluate pronunciation. Please try again.';
          setError(message);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
        }
      };

      mediaRecorder.start();

      // Record for ~3 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 3000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check browser permissions.');
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    const vocab = config?.vocabulary || [];
    if (!vocab || vocab.length === 0) {
      setError('No vocabulary available.');
      return;
    }
    
    if (currentIndex < vocab.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentWord(vocab[nextIndex]);
    } else {
      // Game complete
      const contentIds = vocab.map(v => v.id);
      onComplete('pronunciation_adventure', score, contentIds, 1);
    }
  };

  if (error) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-error">
          <h2>Pronunciation Adventure</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-loading">
          <h2>Pronunciation Adventure</h2>
          <p>Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="game-stats">
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="game-title-section">
        <h2>Pronunciation Adventure</h2>
        <p className="game-instructions">Speak the word clearly</p>
      </div>

      <div className="pronunciation-game">
        <div className="word-display">
          <h1>{currentWord.english_word}</h1>
          <p className="japanese-hint">{currentWord.japanese_word}</p>
        </div>

        <div className="pronunciation-controls">
          <button 
            onClick={handleRecord} 
            className="record-button"
            disabled={isRecording}
          >
            {isRecording ? '🎤 Recording...' : '🎤 Record'}
          </button>
          <button onClick={handleNext} className="next-button">
            Next Word →
          </button>
        </div>
        
        <div className="game-stats" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Score: {score} | Attempts: {attempts}</p>
          {feedback && <p style={{ marginTop: '8px' }}>{feedback}</p>}
        </div>
      </div>
    </div>
  );
}

