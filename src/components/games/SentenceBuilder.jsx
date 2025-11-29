import { useState, useEffect } from 'react';
import './Game.css';

export default function SentenceBuilder({ config, onComplete, onBack }) {
  const [words, setWords] = useState([]);
  const [sentence, setSentence] = useState([]);
  const [score, setScore] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(null);

  // Initialize with example sentence
  useEffect(() => {
    const example = config?.grammar?.[0];
    if (example) {
      const sentenceText = example.examples?.[0] || 'I like apples';
      const shuffled = sentenceText.split(' ').sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setCurrentSentence(sentenceText);
    }
  }, [config]);

  const handleWordClick = (word) => {
    setSentence([...sentence, word]);
    setWords(words.filter(w => w !== word));
  };

  const handleCheck = () => {
    const built = sentence.join(' ');
    if (built === currentSentence) {
      setScore(prev => prev + 20);
      alert('Correct!');
      // Next sentence
      setSentence([]);
    } else {
      alert('Try again!');
      // Reset
      setWords([...sentence, ...words]);
      setSentence([]);
    }
  };

  const handleReset = () => {
    setWords([...sentence, ...words]);
    setSentence([]);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="game-stats">
          <span>Score: {score}</span>
        </div>
      </div>

      <h2>Sentence Builder Blocks</h2>
      <p>Drag words to build the sentence</p>

      <div className="sentence-builder">
        <div className="sentence-area">
          <h3>Your Sentence:</h3>
          <div className="sentence-display">
            {sentence.map((word, index) => (
              <span
                key={index}
                className="sentence-word"
                onClick={() => {
                  setSentence(sentence.filter((_, i) => i !== index));
                  setWords([...words, word]);
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="words-area">
          <h3>Available Words:</h3>
          <div className="words-grid">
            {words.map((word, index) => (
              <button
                key={index}
                className="word-block"
                onClick={() => handleWordClick(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="game-actions">
          <button onClick={handleCheck} className="check-button">Check</button>
          <button onClick={handleReset} className="reset-button">Reset</button>
        </div>
      </div>
    </div>
  );
}

