import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../../../config/well-known-networks';
import { DecimalTooltip, locators } from './decimal-tooltip';

describe('DecimalTooltip', () => {
  it('renders and description the explorer link and docs links', () => {
    // 1127-DECM-001 I can see a tooltip for how to add the decimals to the number
    // 1127-DECM-002 I can see a link in the tooltip to the relevant entity on the block explorer
    // 1127-DECM-003 I can see a link to the documentation about decimals in Vega
    render(
      <MockNetworkProvider>
        <DecimalTooltip
          variableName="decimals"
          entityLink="https://example.com"
          entityText="asset"
        />
      </MockNetworkProvider>
    );

    const [description1] = screen.getAllByTestId(locators.description1);
    expect(description1).toBeInTheDocument();
    expect(description1).toHaveTextContent(
      'This number does not include a decimal point.'
    );

    const [description2] = screen.getAllByTestId(locators.description2);
    expect(description2).toBeInTheDocument();
    expect(description2).toHaveTextContent(
      'To get the value including decimals, find the asset on the block explorer and divide the amount by 10decimals e.g. 1000 with a decimals value of 2 would become 1000 ÷ 102 = 10.'
    );

    const [description3] = screen.getAllByTestId(locators.description3);
    expect(description3).toBeInTheDocument();
    expect(description3).toHaveTextContent('Read more');

    const [tooltipAssetExplorerLink] = screen.getAllByTestId(
      locators.explorerLink
    );
    expect(tooltipAssetExplorerLink).toBeInTheDocument();
    expect(tooltipAssetExplorerLink).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(tooltipAssetExplorerLink).toHaveTextContent('asset');

    const [documentationLink] = screen.getAllByTestId(
      locators.documentationLink
    );

    expect(documentationLink).toBeInTheDocument();
    expect(documentationLink).toHaveAttribute(
      'href',
      `${fairground.docs}/api/using-the-apis#decimal-precision`
    );
    expect(documentationLink).toHaveTextContent('Read more');
  });
});
