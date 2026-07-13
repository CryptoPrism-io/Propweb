import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifiedBadge } from './VerifiedBadge';
import { TrustScoreToken } from './TrustScoreToken';
import { MatchChip } from './MatchChip';
import { Button } from './Button';

describe('primitives', () => {
  it('VerifiedBadge shows "Verified" for owner', () => {
    render(<VerifiedBadge kind="owner" />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });
  it('VerifiedBadge shows pending state', () => {
    render(<VerifiedBadge kind="owner" pending />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
  it('TrustScoreToken renders the numeric score', () => {
    render(<TrustScoreToken score={95} />);
    const el = screen.getByText('95');
    expect(el).toBeInTheDocument();
  });
  it('MatchChip renders the percent', () => {
    render(<MatchChip percent={92} />);
    expect(screen.getByText(/92% match/i)).toBeInTheDocument();
  });
  it('Button renders its label', () => {
    render(<Button>Connect</Button>);
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });
});
