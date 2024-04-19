import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventErc20AssetDelist } from './tx-erc20-asset-delist';

type Delist = components['schemas']['vegaERC20AssetDelist'];

const fullMock: Delist = {
  vegaAssetId: 'asset123',
};

describe('Chain Event: ERC20 Asset Delist', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as Delist;
    const screen = render(
      <TxDetailsChainEventErc20AssetDelist assetDelist={mock} />
    );

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: Delist = {};

    const screen = render(
      <TxDetailsChainEventErc20AssetDelist assetDelist={mock} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventErc20AssetDelist assetDelist={mock} />
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
              <TxDetailsChainEventErc20AssetDelist assetDelist={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 asset removed'))).toBeInTheDocument();

    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.parentElement.textContent).toEqual(fullMock.vegaAssetId);
  });
});
