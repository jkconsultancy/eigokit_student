import { useState, useEffect } from 'react';
import './Game.css';

export default function SentenceBuilder({ config, onComplete, onBack }) {
  const [words, setWords] = useState([]);
  const [sentence, setSentence] = useState([]);
  const [score, setScore] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState([]);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [pairsMatched, setPairsMatched] = useState(0);

  // Initialize with up to 12 sentences from grammar examples
  useEffect(() => {
    if (!config?.grammar) return;
    
    const allSentences = [];
    config.grammar.forEach(grammarItem => {
      if (grammarItem.examples && Array.isArray(grammarItem.examples)) {
        grammarItem.examples.forEach(example => {
          if (example && typeof example === 'string' && example.trim()) {
            allSentences.push(example.trim());
          }
        });
      }
    });
    
    // Limit to 12 sentences
    const selectedSentences = allSentences.slice(0, 12);
    setSentences(selectedSentences);
    
    if (selectedSentences.length > 0) {
      const sentenceText = selectedSentences[0];
      const shuffled = sentenceText.split(' ').sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setCurrentSentence(sentenceText);
      setCurrentSentenceIndex(0);
      setSentence([]);
      setIsCorrect(false);
    }
  }, [config]);

  const loadSentence = (index) => {
    if (index >= sentences.length) {
      // Game complete
      setShowCompletion(true);
      return;
    }
    
    const sentenceText = sentences[index];
    const shuffled = sentenceText.split(' ').sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentSentence(sentenceText);
    setCurrentSentenceIndex(index);
    setSentence([]);
    setIsCorrect(false);
  };

  const handleWordClick = (word) => {
    setSentence([...sentence, word]);
    setWords(words.filter(w => w !== word));
  };

  const handleCheck = () => {
    const built = sentence.join(' ');
    if (built === currentSentence) {
      setScore(prev => prev + 20);
      setPairsMatched(prev => prev + 1);
      setIsCorrect(true);
    } else {
      alert('Try again!');
      // Reset
      setWords([...sentence, ...words]);
      setSentence([]);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex + 1 >= sentences.length) {
      // Last sentence completed
      setShowCompletion(true);
    } else {
      loadSentence(currentSentenceIndex + 1);
    }
  };

  const handleReset = () => {
    setWords([...sentence, ...words]);
    setSentence([]);
    setIsCorrect(false);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setPairsMatched(0);
    setCurrentSentenceIndex(0);
    setShowCompletion(false);
    setIsCorrect(false);
    if (sentences.length > 0) {
      loadSentence(0);
    }
  };

  const handleSaveAndExit = () => {
    onComplete('sentence_builder', score, [], 1);
  };

  if (showCompletion) {
    return (
      <div className="game-container">
        <div className="game-results">
          <h2>Game Complete!</h2>
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Sentences Completed</span>
              <span className="result-value">{pairsMatched} / {sentences.length}</span>
            </div>
          </div>
          <div className="results-actions">
            <button onClick={handlePlayAgain} className="play-again-button">
              Play Again
            </button>
            <button onClick={handleSaveAndExit} className="save-exit-button">
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-error">
          <h2>No Sentences Available</h2>
          <p className="error-message">No grammar examples found. Please ask your teacher to add grammar content.</p>
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
          <span>Sentence {currentSentenceIndex + 1} / {sentences.length}</span>
        </div>
      </div>

      <div className="game-title-section">
        <h2>Sentence Builder Blocks</h2>
        <p className="game-instructions">Drag words to build the sentence</p>
      </div>

      <div className="sentence-builder">
        <div className="sentence-area">
          <h3>Your Sentence:</h3>
          <div className="sentence-display">
            {sentence.length === 0 ? (
              <span style={{ color: '#999', fontStyle: 'italic' }}>Click words below to build your sentence</span>
            ) : (
              sentence.map((word, index) => (
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
              ))
            )}
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
                disabled={isCorrect}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="game-actions">
          {!isCorrect ? (
            <>
              <button onClick={handleCheck} className="check-button" disabled={sentence.length === 0}>
                Check
              </button>
              <button onClick={handleReset} className="reset-button" disabled={sentence.length === 0}>
                Reset
              </button>
            </>
          ) : (
            <button onClick={handleNext} className="check-button">
              {currentSentenceIndex + 1 >= sentences.length ? 'Finish' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

