import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventErc20AssetList } from './tx-erc20-asset-list';

type List = components['schemas']['vegaERC20AssetList'];

const fullMock: List = {
  vegaAssetId: 'asset123',
  assetSource: 'eth123',
};

jest.mock('../../../links/');

describe('Chain Event: ERC20 Asset List', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as List;
    const screen = render(
      <TxDetailsChainEventErc20AssetList assetList={mock} />
    );

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: List = {};

    const screen = render(
      <TxDetailsChainEventErc20AssetList assetList={mock} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventErc20AssetList assetList={mock} />
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
              <TxDetailsChainEventErc20AssetList assetList={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 asset added'))).toBeInTheDocument();

    expect(screen.getByText(t('Added Vega asset'))).toBeInTheDocument();
    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.parentElement.textContent).toEqual(fullMock.vegaAssetId);

    expect(screen.getByText(t('Source'))).toBeInTheDocument();
    const ethLink = screen.getByText(`${fullMock.assetSource}`);
    if (!ethLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(ethLink.parentElement.getAttribute('href')).toContain(
      `/address/${fullMock.assetSource}`
    );
  });
});
