import { Settings } from './settings';
import { render, screen } from '@testing-library/react';

describe('Settings', () => {
  it('should the settings component with all the options', () => {
    render(<Settings />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    expect(screen.getByText('Share usage data')).toBeInTheDocument();
    expect(screen.getByText('Toast location')).toBeInTheDocument();
    expect(screen.getByText('Reset to default')).toBeInTheDocument();
  });
});
