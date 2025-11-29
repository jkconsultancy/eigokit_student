import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PronunciationAdventure from '../PronunciationAdventure';

const makeConfig = () => ({
  vocabulary: [
    { id: '1', english_word: 'apple', japanese_word: 'りんご' },
  ],
});

describe('PronunciationAdventure', () => {
  it('shows first vocabulary word and score', () => {
    render(
      <PronunciationAdventure
        config={makeConfig()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('apple')).toBeInTheDocument();
    // There are two Score labels in this component; just assert at least one exists
    const scoreLabels = screen.getAllByText(/Score:/);
    expect(scoreLabels.length).toBeGreaterThan(0);
  });
});


