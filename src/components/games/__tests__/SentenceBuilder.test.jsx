import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SentenceBuilder from '../SentenceBuilder';

const makeConfig = () => ({
  grammar: [
    {
      id: 'g1',
      rule_name: 'Simple sentence',
      rule_description: '',
      examples: ['I like apples'],
    },
  ],
});

describe('SentenceBuilder', () => {
  it('renders score and words', () => {
    render(
      <SentenceBuilder
        config={makeConfig()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    // Should render at least one word button from the example sentence
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});


