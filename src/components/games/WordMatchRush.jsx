import { useState, useEffect } from 'react';
import './Game.css';

export default function WordMatchRush({ config, onComplete, onBack }) {
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Generate word pairs from config
    const vocab = config?.vocabulary || [];
    const wordPairs = vocab.slice(0, 10).map(v => ({
      english: v.english_word,
      japanese: v.japanese_word,
      id: v.id,
    }));
    setWords(wordPairs);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  const handleWordClick = (word) => {
    if (selectedWord === null) {
      setSelectedWord(word);
    } else if (selectedWord.english === word.english && selectedWord.japanese === word.japanese) {
      // Match found
      setScore(prev => prev + 10);
      setWords(prev => prev.filter(w => w.id !== word.id));
      setSelectedWord(null);
    } else {
      // Wrong match
      setSelectedWord(null);
    }
  };

  if (gameOver || words.length === 0) {
    const contentIds = config?.vocabulary?.map(v => v.id) || [];
    onComplete('word_match_rush', score, contentIds, 1);
    return null;
  }

  const englishWords = words.map(w => w.english);
  const japaneseWords = words.map(w => w.japanese);

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
        </div>
      </div>

      <h2>Word Match Rush</h2>
      <p>Match English words with their Japanese meanings</p>

      <div className="match-game">
        <div className="word-column">
          <h3>English</h3>
          {englishWords.map((word, index) => (
            <button
              key={index}
              className={`word-button ${selectedWord?.english === word ? 'selected' : ''}`}
              onClick={() => handleWordClick(words.find(w => w.english === word))}
            >
              {word}
            </button>
          ))}
        </div>

        <div className="word-column">
          <h3>Japanese</h3>
          {japaneseWords.map((word, index) => (
            <button
              key={index}
              className={`word-button ${selectedWord?.japanese === word ? 'selected' : ''}`}
              onClick={() => handleWordClick(words.find(w => w.japanese === word))}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

