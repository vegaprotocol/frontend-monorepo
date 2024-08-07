import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as vegaSubHeaderLocators } from '@/components/sub-header';
import { locators as vegaSectionLocators } from '@/components/vega-section';
import { type Connection } from '@/types/backend';

import { DetailsSection, locators } from './details-list';
const renderComponent = (connection: Connection) => {
  return render(
    <MemoryRouter>
      <DetailsSection connection={connection} />
    </MemoryRouter>
  );
};

describe('ConnectionDetailsSection', () => {
  it('renders connection details', async () => {
    const connection = {
      origin: 'test',
      accessedAt: 0,
      chainId: 'chainId',
      networkId: 'networkId',
      allowList: {
        publicKeys: [],
        wallets: [],
      },
      autoConsent: false,
    };
    renderComponent(connection);
    const sections = await screen.findAllByTestId(
      vegaSectionLocators.vegaSection
    );
    const [origin, lastAccessed, chainId, networkId] = sections;
    expect(
      within(origin).getByTestId(vegaSubHeaderLocators.subHeader)
    ).toHaveTextContent('Origin');
    expect(within(origin).getByTestId(locators.origin)).toHaveTextContent(
      'test'
    );

    expect(
      within(lastAccessed).getByTestId(vegaSubHeaderLocators.subHeader)
    ).toHaveTextContent('Last accessed');
    expect(
      within(lastAccessed).getByTestId(locators.accessedAt)
    ).toHaveTextContent('1/1/1970, 12:00:00 AM');

    expect(
      within(chainId).getByTestId(vegaSubHeaderLocators.subHeader)
    ).toHaveTextContent('Chain Id');
    expect(within(chainId).getByTestId(locators.chainId)).toHaveTextContent(
      connection.chainId
    );

    const networkIdLink = within(networkId).getByTestId(locators.networkId);
    expect(
      within(networkId).getByTestId(vegaSubHeaderLocators.subHeader)
    ).toHaveTextContent('Network Id');
    expect(networkIdLink).toHaveTextContent(connection.networkId);
    expect(networkIdLink).toHaveAttribute(
      'href',
      '/auth/settings/networks/networkId'
    );

    // TODO this should be in the delete connection test
    // expect(screen.getByTestId(locators.removeConnection)).toHaveTextContent('Remove connection')
  });
});
