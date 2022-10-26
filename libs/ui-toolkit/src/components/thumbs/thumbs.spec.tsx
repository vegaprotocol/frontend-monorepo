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
    expect(screen.getByText('👍 test')).toBeInTheDocument();
  });
});
