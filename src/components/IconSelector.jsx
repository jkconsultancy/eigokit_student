import { useState, useEffect } from 'react';
import './IconSelector.css';

// Full icon map (48 icons)
const ALL_ICONS = [
  { id: 1, name: 'apple', emoji: '🍎' },
  { id: 2, name: 'banana', emoji: '🍌' },
  { id: 3, name: 'orange', emoji: '🍊' },
  { id: 4, name: 'strawberry', emoji: '🍓' },
  { id: 5, name: 'cat', emoji: '🐱' },
  { id: 6, name: 'dog', emoji: '🐶' },
  { id: 7, name: 'bird', emoji: '🐦' },
  { id: 8, name: 'rabbit', emoji: '🐰' },
  { id: 9, name: 'book', emoji: '📚' },
  { id: 10, name: 'pencil', emoji: '✏️' },
  { id: 11, name: 'ball', emoji: '⚽' },
  { id: 12, name: 'car', emoji: '🚗' },
  { id: 13, name: 'sun', emoji: '☀️' },
  { id: 14, name: 'moon', emoji: '🌙' },
  { id: 15, name: 'star', emoji: '⭐' },
  { id: 16, name: 'heart', emoji: '❤️' },
  { id: 17, name: 'house', emoji: '🏠' },
  { id: 18, name: 'tree', emoji: '🌳' },
  { id: 19, name: 'flower', emoji: '🌸' },
  { id: 20, name: 'fish', emoji: '🐟' },
  { id: 21, name: 'bear', emoji: '🐻' },
  { id: 22, name: 'lion', emoji: '🦁' },
  { id: 23, name: 'elephant', emoji: '🐘' },
  { id: 24, name: 'butterfly', emoji: '🦋' },
  { id: 25, name: 'panda', emoji: '🐼' },
  { id: 26, name: 'tiger', emoji: '🐯' },
  { id: 27, name: 'cow', emoji: '🐮' },
  { id: 28, name: 'pig', emoji: '🐷' },
  { id: 29, name: 'frog', emoji: '🐸' },
  { id: 30, name: 'duck', emoji: '🦆' },
  { id: 31, name: 'horse', emoji: '🐴' },
  { id: 32, name: 'sheep', emoji: '🐑' },
  { id: 33, name: 'giraffe', emoji: '🦒' },
  { id: 34, name: 'zebra', emoji: '🦓' },
  { id: 35, name: 'monkey', emoji: '🐵' },
  { id: 36, name: 'chicken', emoji: '🐔' },
  { id: 37, name: 'penguin', emoji: '🐧' },
  { id: 38, name: 'owl', emoji: '🦉' },
  { id: 39, name: 'dolphin', emoji: '🐬' },
  { id: 40, name: 'whale', emoji: '🐋' },
  { id: 41, name: 'shark', emoji: '🦈' },
  { id: 42, name: 'turtle', emoji: '🐢' },
  { id: 43, name: 'snake', emoji: '🐍' },
  { id: 44, name: 'spider', emoji: '🕷️' },
  { id: 45, name: 'bee', emoji: '🐝' },
  { id: 46, name: 'snail', emoji: '🐌' },
  { id: 47, name: 'crab', emoji: '🦀' },
  { id: 48, name: 'lobster', emoji: '🦞' },
];

const ICON_MAP = Object.fromEntries(ALL_ICONS.map(icon => [icon.id, icon]));

export default function IconSelector({ selectedIcons, onSelect, maxSelections = 5, availableIcons = [] }) {
  const [selection, setSelection] = useState(selectedIcons || []);

  // Use availableIcons if provided, otherwise use all icons
  const iconsToShow = availableIcons.length > 0 
    ? availableIcons.map(icon => ({
        id: icon.id,
        name: icon.name || `icon-${icon.id}`,
        emoji: icon.emoji || ICON_MAP[icon.id]?.emoji || '❓'
      }))
    : ALL_ICONS;

  useEffect(() => {
    setSelection(selectedIcons || []);
  }, [selectedIcons]);

  const handleIconClick = (iconId) => {
    if (selection.includes(iconId)) {
      // Remove if already selected
      const newSelection = selection.filter(id => id !== iconId);
      setSelection(newSelection);
      onSelect(newSelection);
    } else if (selection.length < maxSelections) {
      // Add if not at max
      const newSelection = [...selection, iconId];
      setSelection(newSelection);
      onSelect(newSelection);
    }
  };

  return (
    <div className="icon-selector">
      <h3>Select {maxSelections} icons (in order):</h3>
      <div className="icon-grid">
        {iconsToShow.map(icon => (
          <button
            key={icon.id}
            className={`icon-button ${selection.includes(icon.id) ? 'selected' : ''}`}
            onClick={() => handleIconClick(icon.id)}
            disabled={!selection.includes(icon.id) && selection.length >= maxSelections}
          >
            <span className="icon-emoji">{icon.emoji}</span>
          </button>
        ))}
      </div>
      <div className="selected-icons">
        <p>Selected: {selection.length} / {maxSelections}</p>
        {selection.length > 0 && (
          <div className="selected-sequence">
            {selection.map((id, index) => {
              const icon = iconsToShow.find(i => i.id === id) || ICON_MAP[id];
              return (
                <span key={index} className="sequence-icon">
                  {icon?.emoji || '❓'} {index + 1}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

