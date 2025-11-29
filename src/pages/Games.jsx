import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../lib/api';
import WordMatchRush from '../components/games/WordMatchRush';
import SentenceBuilder from '../components/games/SentenceBuilder';
import PronunciationAdventure from '../components/games/PronunciationAdventure';
import './Games.css';

export default function Games() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (!studentId) {
      window.location.href = '/signin';
      return;
    }

    const loadConfig = async () => {
      try {
        const config = await studentAPI.getGameConfig(studentId);
        setGameConfig(config);
      } catch (error) {
        console.error('Failed to load game config:', error);
      }
    };

    loadConfig();
  }, [studentId]);

  const games = [
    {
      id: 'word_match_rush',
      name: 'Word Match Rush',
      description: 'Match English words to pictures or Japanese equivalents',
      component: WordMatchRush,
    },
    {
      id: 'sentence_builder',
      name: 'Sentence Builder Blocks',
      description: 'Drag-and-drop tiles to build sentences',
      component: SentenceBuilder,
    },
    {
      id: 'pronunciation_adventure',
      name: 'Pronunciation Adventure',
      description: 'Speak words and get pronunciation feedback',
      component: PronunciationAdventure,
    },
  ];

  const handleGameComplete = async (gameType, score, contentIds, difficulty) => {
    try {
      await studentAPI.submitGameSession(studentId, {
        game_type: gameType,
        score,
        content_ids: contentIds,
        difficulty_level: difficulty,
      });
      alert(`Game completed! Score: ${score}`);
      setSelectedGame(null);
    } catch (error) {
      console.error('Failed to submit game session:', error);
    }
  };

  if (selectedGame) {
    const GameComponent = games.find(g => g.id === selectedGame)?.component;
    if (GameComponent) {
      return (
        <GameComponent
          config={gameConfig}
          onComplete={handleGameComplete}
          onBack={() => setSelectedGame(null)}
        />
      );
    }
  }

  return (
    <div className="games-page">
      <div className="games-container">
        <h1>Practice Games</h1>
        <p className="subtitle">Choose a game to practice English!</p>

        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <button
                className="play-button"
                onClick={() => setSelectedGame(game.id)}
              >
                Play
              </button>
            </div>
          ))}
        </div>

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

