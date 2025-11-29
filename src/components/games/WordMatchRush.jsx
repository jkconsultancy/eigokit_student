import { useState, useEffect, useRef } from 'react';
import './Game.css';

export default function WordMatchRush({ config, onComplete, onBack }) {
  const [words, setWords] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null); // 'en' | 'jp' | null
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [correctPairIds, setCorrectPairIds] = useState([]); // [id1, id2] while flashing green
  const [incorrectPairIds, setIncorrectPairIds] = useState([]); // [id1, id2] while flashing red
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const timeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const vocab = config?.vocabulary || [];

    if (!config) {
      // Wait for config to load before initializing the game
      setInitialized(false);
      setWords([]);
      return;
    }

    if (vocab.length === 0) {
      // No words available for this student/class
      setError('No vocabulary available. Please ask your teacher to add vocabulary words.');
      setInitialized(true);
      setWords([]);
      return;
    }

    // Generate word pairs from config
    const wordPairs = vocab.slice(0, 10).map(v => ({
      english: v.english_word,
      japanese: v.japanese_word,
      id: v.id,
    }));
    setWords(wordPairs);
    setError(null);
    setInitialized(true);

    // Timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [config]);

  const handleWordClick = (clickedId, side) => {
    if (!initialized || gameOver || !words.length) return;

    // If we're currently animating a pair, ignore further clicks
    if (correctPairIds.length > 0 || incorrectPairIds.length > 0) {
      return;
    }

    const clickedWord = words.find((w) => w.id === clickedId);
    if (!clickedWord) return;

    // First selection
    if (!selectedWordId) {
      setSelectedWordId(clickedId);
      setSelectedSide(side);
      return;
    }

    // If they click the same word again (same ID and same side), just deselect
    if (selectedWordId === clickedId && selectedSide === side) {
      setSelectedWordId(null);
      setSelectedSide(null);
      return;
    }

    // Check if it's a match (same ID but different side)
    const isMatch = selectedWordId === clickedId && selectedSide !== side;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isMatch) {
      // Correct: flash green for 1 second, then remove the pair and add score
      setScore((prev) => prev + 10);
      setCorrectPairIds([selectedWordId, clickedId]);
      timeoutRef.current = setTimeout(() => {
        setWords((prev) => prev.filter((w) => w.id !== selectedWordId));
        setSelectedWordId(null);
        setSelectedSide(null);
        setCorrectPairIds([]);
        timeoutRef.current = null;
      }, 1000);
    } else {
      // Incorrect: flash red, then reset selection
      setIncorrectPairIds([selectedWordId, clickedId]);
      timeoutRef.current = setTimeout(() => {
        setSelectedWordId(null);
        setSelectedSide(null);
        setIncorrectPairIds([]);
        timeoutRef.current = null;
      }, 600);
    }
  };

  // Handle game completion - show results instead of immediately calling onComplete
  useEffect(() => {
    if (!initialized || error || showResults) return;
    if (!config || !config.vocabulary || config.vocabulary.length === 0) return;

    if (gameOver || words.length === 0) {
      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Calculate results
      const totalPairs = config.vocabulary.slice(0, 10).length;
      const matchedPairs = totalPairs - words.length;
      const completionTime = 60 - timeLeft;
      
      setFinalResults({
        score,
        timeRemaining: timeLeft,
        completionTime,
        matchedPairs,
        totalPairs,
        completed: words.length === 0, // true if all pairs matched, false if time ran out
      });
      setShowResults(true);
    }
  }, [initialized, error, gameOver, words.length, config, score, timeLeft, showResults]);

  const handlePlayAgain = () => {
    // Reset game state
    const vocab = config?.vocabulary || [];
    const wordPairs = vocab.slice(0, 10).map(v => ({
      english: v.english_word,
      japanese: v.japanese_word,
      id: v.id,
    }));
    
    setWords(wordPairs);
    setSelectedWordId(null);
    setSelectedSide(null);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setShowResults(false);
    setFinalResults(null);
    setCorrectPairIds([]);
    setIncorrectPairIds([]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Restart timer
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSaveAndExit = () => {
    if (finalResults) {
      const contentIds = config?.vocabulary?.map(v => v.id) || [];
      onComplete('word_match_rush', finalResults.score, contentIds, 1);
    }
  };

  if (!initialized && !error) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-loading">
          <h2>Word Match Rush</h2>
          <p>Loading words...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-error">
          <h2>Word Match Rush</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (showResults && finalResults) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
        </div>
        <div className="game-results">
          <h2>Game Complete!</h2>
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score:</span>
              <span className="result-value">{finalResults.score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Pairs Matched:</span>
              <span className="result-value">{finalResults.matchedPairs} / {finalResults.totalPairs}</span>
            </div>
            {finalResults.completed ? (
              <div className="result-item">
                <span className="result-label">Time Remaining:</span>
                <span className="result-value">{finalResults.timeRemaining}s</span>
              </div>
            ) : (
              <div className="result-item">
                <span className="result-label">Time Taken:</span>
                <span className="result-value">{finalResults.completionTime}s</span>
              </div>
            )}
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

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="game-title-section">
        <h2>Word Match Rush</h2>
        <p className="game-instructions">Match English words with their Japanese meanings</p>
      </div>

      <div className="match-game">
        <div className="word-column">
          <h3>English</h3>
          {words.map((w) => {
            const inCorrectPair = correctPairIds.includes(w.id);
            const inIncorrectPair = incorrectPairIds.includes(w.id);
            const statusClass = inCorrectPair
              ? 'correct'
              : inIncorrectPair
              ? 'incorrect'
              : selectedWordId === w.id && selectedSide === 'en'
              ? 'selected'
              : '';
            return (
            <button
              key={`en-${w.id}`}
              className={`word-button ${statusClass}`}
              onClick={() => handleWordClick(w.id, 'en')}
            >
              {w.english}
            </button>
          )})}
        </div>

        <div className="word-column">
          <h3>Japanese</h3>
          {words.map((w) => {
            const inCorrectPair = correctPairIds.includes(w.id);
            const inIncorrectPair = incorrectPairIds.includes(w.id);
            const statusClass = inCorrectPair
              ? 'correct'
              : inIncorrectPair
              ? 'incorrect'
              : selectedWordId === w.id && selectedSide === 'jp'
              ? 'selected'
              : '';
            return (
            <button
              key={`jp-${w.id}`}
              className={`word-button ${statusClass}`}
              onClick={() => handleWordClick(w.id, 'jp')}
            >
              {w.japanese}
            </button>
          )})}
        </div>
      </div>
    </div>
  );
}

