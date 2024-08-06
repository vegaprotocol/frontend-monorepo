import { fireEvent, render, screen } from '@testing-library/react';

import generalLocators from '../locators';
import { CollapsibleCard, locators } from './collapsible-card';

const renderComponent = ({ initiallyOpen }: { initiallyOpen?: boolean }) => {
  return render(
    <CollapsibleCard
      title="Title"
      initiallyOpen={initiallyOpen}
      cardContent={<div>Card content</div>}
    />
  );
};

describe('Collapsible panel', () => {
  it('renders title, arrow and does not render content', () => {
    renderComponent({});
    expect(screen.getByTestId(locators.collapsibleCard)).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByTestId(locators.collapsibleCardContent)).toHaveClass(
      'hidden'
    );
    expect(
      screen.getByTestId(generalLocators.dropdownArrow)
    ).toBeInTheDocument();
  });
  it('opens and closes panel on click', () => {
    renderComponent({});
    fireEvent.click(screen.getByTestId(locators.collapsibleCardButton));
    expect(screen.getByTestId(locators.collapsibleCardContent)).not.toHaveClass(
      'hidden'
    );
    expect(screen.getByTestId(generalLocators.dropdownArrow)).toHaveClass(
      'rotate-180'
    );
    fireEvent.click(screen.getByTestId(locators.collapsibleCardButton));
    expect(screen.getByTestId(locators.collapsibleCardContent)).toHaveClass(
      'hidden'
    );
    expect(screen.getByTestId(generalLocators.dropdownArrow)).not.toHaveClass(
      'rotate-180'
    );
  });
  it('renders panel as open when initially open is true', () => {
    renderComponent({ initiallyOpen: true });
    expect(screen.getByTestId(locators.collapsibleCardContent)).not.toHaveClass(
      'hidden'
    );
    expect(screen.getByTestId(generalLocators.dropdownArrow)).toHaveClass(
      'rotate-180'
    );
  });
});
