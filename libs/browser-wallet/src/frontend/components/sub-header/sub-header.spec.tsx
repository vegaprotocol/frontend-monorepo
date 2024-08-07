import { render, screen } from '@testing-library/react';

import { locators, SubHeader } from './sub-header';

describe('SubHeader', () => {
  it('renders the header text correctly', () => {
    const headerText = 'Some text';
    render(<SubHeader content={headerText} />);
    const headerElement = screen.getByTestId(locators.subHeader);
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent(headerText);
  });
});
