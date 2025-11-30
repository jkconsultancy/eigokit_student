import { useState, useEffect, useRef } from 'react';
import './Game.css';

export default function WordMatchRush({ config, onComplete, onBack }) {
  // Immutable reference: All word pairs from server (never changes)
  const wordPairsRef = useRef([]);
  
  // Mutable references: Randomized display lists
  const [englishDisplayList, setEnglishDisplayList] = useState([]);
  const [japaneseDisplayList, setJapaneseDisplayList] = useState([]);
  
  // Mutable reference: Current selections (max 1 English + 1 Japanese)
  const [currentSelections, setCurrentSelections] = useState({
    english: null, // { id, word } or null
    japanese: null, // { id, word } or null
  });
  
  // Visual feedback states
  const [flashingCorrect, setFlashingCorrect] = useState(new Set()); // Word IDs flashing green
  const [flashingIncorrectPair, setFlashingIncorrectPair] = useState(null); // { englishId: id, japaneseId: id } | null - ONLY the most recent incorrect pair
  
  // Game state
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const timeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize game with word pairs from server
  useEffect(() => {
    const vocab = config?.vocabulary || [];

    if (!config) {
      setInitialized(false);
      return;
    }

    if (vocab.length === 0) {
      setError('No vocabulary available. Please ask your teacher to add vocabulary words.');
      setInitialized(true);
      return;
    }

    // Store immutable reference: all word pairs from server
    const pairs = vocab.slice(0, 10).map(v => ({
      id: v.id,
      english: v.english_word,
      japanese: v.japanese_word,
    }));
    wordPairsRef.current = pairs;

    // Generate randomized mutable display lists
    setEnglishDisplayList(shuffleArray(pairs.map(p => ({ id: p.id, word: p.english }))));
    setJapaneseDisplayList(shuffleArray(pairs.map(p => ({ id: p.id, word: p.japanese }))));
    
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

  // Check if current selections form a correct match
  const checkMatch = () => {
    const { english, japanese } = currentSelections;
    
    if (!english || !japanese) {
      return false; // Need both selections
    }

    // Check against immutable server data reference
    const pair = wordPairsRef.current.find(p => p.id === english.id);
    return pair && pair.id === japanese.id; // Same ID means correct match
  };

  // Handle word click
  const handleWordClick = (wordId, side) => {
    if (!initialized || gameOver) return;
    
    // Ignore clicks during animations
    if (flashingCorrect.size > 0 || flashingIncorrectPair !== null) {
      return;
    }

    // Find the word in the immutable reference
    const wordPair = wordPairsRef.current.find(p => p.id === wordId);
    if (!wordPair) return;

    const wordData = {
      id: wordId,
      word: side === 'en' ? wordPair.english : wordPair.japanese,
    };

    setCurrentSelections(prev => {
      const newSelections = { ...prev };

      // If clicking the same word again, deselect it
      if (side === 'en') {
        if (prev.english?.id === wordId) {
          newSelections.english = null;
          return newSelections;
        }
        newSelections.english = wordData;
        // Can only have 1 English selection
      } else {
        if (prev.japanese?.id === wordId) {
          newSelections.japanese = null;
          return newSelections;
        }
        newSelections.japanese = wordData;
        // Can only have 1 Japanese selection
      }

      // If we now have both selections, check for match
      if (newSelections.english && newSelections.japanese) {
        const isMatch = newSelections.english.id === newSelections.japanese.id;
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (isMatch) {
          // Correct match: flash both green, then remove from display
          setScore(prev => prev + 10);
          setFlashingCorrect(new Set([newSelections.english.id, newSelections.japanese.id]));
          
          timeoutRef.current = setTimeout(() => {
            // Remove from display lists
            setEnglishDisplayList(prev => prev.filter(w => w.id !== newSelections.english.id));
            setJapaneseDisplayList(prev => prev.filter(w => w.id !== newSelections.japanese.id));
            
            // Clear selections and flash state
            setCurrentSelections({ english: null, japanese: null });
            setFlashingCorrect(new Set());
            timeoutRef.current = null;
          }, 1000);
        } else {
          // Incorrect match: flash ONLY this specific pair red, then clear selections
          const englishId = newSelections.english.id;
          const japaneseId = newSelections.japanese.id;
          
          // Store the exact pair that should flash
          setFlashingIncorrectPair({ englishId, japaneseId });
          
          timeoutRef.current = setTimeout(() => {
            // Clear selections and flash state
            setCurrentSelections({ english: null, japanese: null });
            setFlashingIncorrectPair(null);
            timeoutRef.current = null;
          }, 600);
        }
      }

      return newSelections;
    });
  };

  // Handle game completion
  useEffect(() => {
    if (!initialized || error || showResults) return;
    if (!wordPairsRef.current.length) return;

    const totalPairs = wordPairsRef.current.length;
    const remainingPairs = englishDisplayList.length;

    if (gameOver || remainingPairs === 0) {
      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const matchedPairs = totalPairs - remainingPairs;
      const completionTime = 60 - timeLeft;
      
      setFinalResults({
        score,
        timeRemaining: timeLeft,
        completionTime,
        matchedPairs,
        totalPairs,
        completed: remainingPairs === 0,
      });
      setShowResults(true);
    }
  }, [initialized, error, gameOver, englishDisplayList.length, score, timeLeft, showResults]);

  const handlePlayAgain = () => {
    // Reset game state
    const pairs = wordPairsRef.current;
    
    setEnglishDisplayList(shuffleArray(pairs.map(p => ({ id: p.id, word: p.english }))));
    setJapaneseDisplayList(shuffleArray(pairs.map(p => ({ id: p.id, word: p.japanese }))));
    setCurrentSelections({ english: null, japanese: null });
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setShowResults(false);
    setFinalResults(null);
    setFlashingCorrect(new Set());
    setFlashingIncorrectPair(null);
    
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
      const contentIds = wordPairsRef.current.map(p => p.id);
      // Submit game session - backend will update streak
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
          {englishDisplayList.map((w) => {
            const isSelected = currentSelections.english?.id === w.id;
            const isFlashingCorrect = flashingCorrect.has(w.id);
            // Only flash if this is the English word in the current incorrect pair
            const isFlashingIncorrect = flashingIncorrectPair?.englishId === w.id;
            
            const statusClass = isFlashingCorrect
              ? 'correct'
              : isFlashingIncorrect
              ? 'incorrect'
              : isSelected
              ? 'selected'
              : '';
            
            return (
              <button
                key={`en-${w.id}`}
                className={`word-button ${statusClass}`}
                onClick={() => handleWordClick(w.id, 'en')}
              >
                {w.word}
              </button>
            );
          })}
        </div>

        <div className="word-column">
          <h3>Japanese</h3>
          {japaneseDisplayList.map((w) => {
            const isSelected = currentSelections.japanese?.id === w.id;
            const isFlashingCorrect = flashingCorrect.has(w.id);
            // Only flash if this is the Japanese word in the current incorrect pair
            const isFlashingIncorrect = flashingIncorrectPair?.japaneseId === w.id;
            
            const statusClass = isFlashingCorrect
              ? 'correct'
              : isFlashingIncorrect
              ? 'incorrect'
              : isSelected
              ? 'selected'
              : '';
            
            return (
              <button
                key={`jp-${w.id}`}
                className={`word-button ${statusClass}`}
                onClick={() => handleWordClick(w.id, 'jp')}
              >
                {w.word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
