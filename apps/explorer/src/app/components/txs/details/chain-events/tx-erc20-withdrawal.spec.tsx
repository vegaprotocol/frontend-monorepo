import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventWithdrawal } from './tx-erc20-withdrawal';
type Withdrawal = components['schemas']['vegaERC20Withdrawal'];

const fullMock: Partial<Withdrawal> = {
  vegaAssetId: 'asset123',
  targetEthereumAddress: 'eth123',
};

describe('Chain Event: ERC20 asset deposit', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as Withdrawal;
    const screen = render(<TxDetailsChainEventWithdrawal withdrawal={mock} />);

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: Withdrawal = {};

    const screen = render(<TxDetailsChainEventWithdrawal withdrawal={mock} />);
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventWithdrawal withdrawal={mock} />
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
              <TxDetailsChainEventWithdrawal withdrawal={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 withdrawal'))).toBeInTheDocument();

    expect(screen.getByText(t('Asset'))).toBeInTheDocument();
    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.parentElement.textContent).toEqual(fullMock.vegaAssetId);

    expect(screen.getByText(t('Recipient'))).toBeInTheDocument();
    const ethLink = screen.getByText(`${fullMock.targetEthereumAddress}`);
    if (!ethLink.parentElement) {
      throw new Error('ETH link does not exist');
    }
    expect(ethLink.parentElement.getAttribute('href')).toContain(
      `/address/${fullMock.targetEthereumAddress}`
    );
  });
});
