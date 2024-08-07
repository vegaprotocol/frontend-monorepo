import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as subheaderLocators } from '@/components/sub-header';
import { FULL_ROUTES } from '@/routes/route-names';

import { locators, NetworksSection } from './networks-section';

const renderComponent = () =>
  render(
    <MemoryRouter>
      <NetworksSection />
    </MemoryRouter>
  );

describe('NetworksSection', () => {
  it('renders title with link to settings networks page', () => {
    renderComponent();
    expect(screen.getByTestId(subheaderLocators.subHeader)).toHaveTextContent(
      'Networks'
    );
    expect(screen.getByTestId(locators.viewNetworks)).toHaveTextContent(
      'View configured networks'
    );
    expect(screen.getByTestId(locators.viewNetworksButton)).toHaveAttribute(
      'href',
      FULL_ROUTES.networksSettings
    );
  });
});
