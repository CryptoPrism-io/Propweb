import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the promoted desktop links', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    ['Browse rentals', 'How it works', 'Trust & verification', 'Pricing'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('opens the slide-in menu from the desktop hamburger button too', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const openButtons = screen.getAllByLabelText('Open menu');
    expect(openButtons.length).toBe(2); // mobile bar + desktop bar
    fireEvent.click(openButtons[openButtons.length - 1]);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });
});
