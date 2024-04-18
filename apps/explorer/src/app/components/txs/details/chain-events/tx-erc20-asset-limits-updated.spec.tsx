import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventErc20AssetLimitsUpdated } from './tx-erc20-asset-limits-updated';

type AssetLimitsUpdated = components['schemas']['vegaERC20AssetLimitsUpdated'];

const fullMock: AssetLimitsUpdated = {
  sourceEthereumAddress: 'eth123',
  vegaAssetId: 'asset123',
  lifetimeLimits: '100',
  withdrawThreshold: '60',
};

describe('Chain Event: ERC20 Asset limits updated', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as AssetLimitsUpdated;
    const screen = render(
      <TxDetailsChainEventErc20AssetLimitsUpdated assetLimitsUpdated={mock} />
    );

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: AssetLimitsUpdated = {};

    const screen = render(
      <TxDetailsChainEventErc20AssetLimitsUpdated assetLimitsUpdated={mock} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventErc20AssetLimitsUpdated assetLimitsUpdated={mock} />
      );
      expect(screen.container).toBeEmptyDOMElement();
    }
  });

  it('Renders TableRows if all data is provided', () => {
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainEventErc20AssetLimitsUpdated
                assetLimitsUpdated={fullMock}
              />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('ERC20 asset limits update'))
    ).toBeInTheDocument();
    expect(screen.getByText(t('Total lifetime limit'))).toBeInTheDocument();
    expect(screen.getByText(`${fullMock.lifetimeLimits}`)).toBeInTheDocument();
    expect(
      screen.getByText(t('Asset withdrawal threshold'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fullMock.withdrawThreshold}`)
    ).toBeInTheDocument();

    expect(screen.getByText(t('Vega asset'))).toBeInTheDocument();
    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.parentElement.textContent).toEqual(fullMock.vegaAssetId);

    expect(screen.getByText(t('ERC20 asset'))).toBeInTheDocument();
    const ethLink = screen.getByText(`${fullMock.sourceEthereumAddress}`);
    if (!ethLink.parentElement) {
      throw new Error('ETH link does not exist');
    }
    expect(ethLink.parentElement.getAttribute('href')).toContain(
      `/address/${fullMock.sourceEthereumAddress}`
    );
  });
});
