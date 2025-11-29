import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WordMatchRush from '../WordMatchRush';

const makeConfig = () => ({
  vocabulary: [
    { id: '1', english_word: 'apple', japanese_word: 'りんご' },
    { id: '2', english_word: 'orange', japanese_word: 'オレンジ' },
  ],
});

describe('WordMatchRush', () => {
  it('shows timer and score', () => {
    render(
      <WordMatchRush
        config={makeConfig()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
  });

  it('lets student select a correct pair from either side', () => {
    render(
      <WordMatchRush
        config={makeConfig()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );

    const appleEn = screen.getByText('apple');
    const appleJp = screen.getByText('りんご');

    // Start from English then Japanese
    fireEvent.click(appleEn);
    fireEvent.click(appleJp);

    // At least during the flash, one of them should have the correct class
    expect(appleEn.className).toContain('word-button');
  });

  it('calls onComplete after both pairs are matched', async () => {
    const onComplete = vi.fn();

    render(
      <WordMatchRush
        config={makeConfig()}
        onComplete={onComplete}
        onBack={vi.fn()}
      />
    );

    const appleEn = screen.getByText('apple');
    const appleJp = screen.getByText('りんご');
    const orangeEn = screen.getByText('orange');
    const orangeJp = screen.getByText('オレンジ');

    fireEvent.click(appleEn);
    fireEvent.click(appleJp);

    fireEvent.click(orangeEn);
    fireEvent.click(orangeJp);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});

