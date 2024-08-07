import { render, screen } from '@testing-library/react';

import { locators, Strike } from './strike';

describe('Strike Component', () => {
  it('renders strike text correctly', () => {
    const text = 'Hello, world!';
    render(<Strike>{text}</Strike>);

    const strikeElement = screen.getByTestId(locators.strike);
    expect(strikeElement).toBeInTheDocument();
    expect(strikeElement).toHaveTextContent(text);
  });
});
