import { render, screen } from '@testing-library/react';
import { Thumbs } from './thumbs';

describe('Thumbs', () => {
  it('renders up', () => {
    render(<Thumbs up={true} />);
    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('renders down', () => {
    render(<Thumbs up={false} />);
    expect(screen.getByText('👎')).toBeInTheDocument();
  });

  it('renders text', () => {
    render(<Thumbs up={true} text="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders text with class of font-mono when fontMono arg is true', () => {
    render(<Thumbs up={true} text="test" monoFont={true} />);
    expect(screen.getByText('test')).toHaveClass('font-mono');
  });
});
