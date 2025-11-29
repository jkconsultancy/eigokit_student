import { useState, useEffect } from 'react';
import './Game.css';

export default function PronunciationAdventure({ config, onComplete, onBack }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const vocab = config?.vocabulary || [];
    if (vocab.length > 0) {
      setCurrentWord(vocab[0]);
    }
  }, [config]);

  const handleRecord = async () => {
    // In a real implementation, this would use Web Speech API
    alert('Pronunciation recording would start here. This is a demo.');
    setAttempts(prev => prev + 1);
    setScore(prev => prev + 10);
  };

  const handleNext = () => {
    const vocab = config?.vocabulary || [];
    const currentIndex = vocab.findIndex(v => v.id === currentWord?.id);
    if (currentIndex < vocab.length - 1) {
      setCurrentWord(vocab[currentIndex + 1]);
    } else {
      // Game complete
      const contentIds = vocab.map(v => v.id);
      onComplete('pronunciation_adventure', score, contentIds, 1);
    }
  };

  if (!currentWord) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="game-stats">
          <span>Score: {score}</span>
        </div>
      </div>

      <h2>Pronunciation Adventure</h2>
      <p>Speak the word clearly</p>

      <div className="pronunciation-game">
        <div className="word-display">
          <h1>{currentWord.english_word}</h1>
          <p className="japanese-hint">{currentWord.japanese_word}</p>
        </div>

        <div className="pronunciation-controls">
          <button onClick={handleRecord} className="record-button">
            🎤 Record
          </button>
          <button onClick={handleNext} className="next-button">
            Next Word →
          </button>
        </div>
      </div>
    </div>
  );
}

