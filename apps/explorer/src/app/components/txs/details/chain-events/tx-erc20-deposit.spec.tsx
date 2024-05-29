import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainEventDeposit } from './tx-erc20-deposit';

type Deposit = components['schemas']['vegaERC20Deposit'];

const fullMock: Deposit = {
  vegaAssetId:
    '0000000000000000000000000000000000000000000000000000000000000002',
  amount: 'amount123',
  sourceEthereumAddress: 'eth123',
  targetPartyId:
    '0000000000000000000000000000000000000000000000000000000000000001',
};

jest.mock('../../../links');

describe('Chain Event: ERC20 asset deposit', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as Deposit;
    const screen = render(<TxDetailsChainEventDeposit deposit={mock} />);

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: Deposit = {};

    const screen = render(<TxDetailsChainEventDeposit deposit={mock} />);
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(<TxDetailsChainEventDeposit deposit={mock} />);
      expect(screen.container).toBeEmptyDOMElement();
    }
  });

  it('Renders TableRows if all data is provided', () => {
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainEventDeposit deposit={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(screen.getByText(t('ERC20 deposit'))).toBeInTheDocument();
    expect(screen.getByText(t('Asset'))).toBeInTheDocument();
    expect(screen.getByText(`${fullMock.vegaAssetId}`)).toBeInTheDocument();
    expect(screen.getByText(t('Amount'))).toBeInTheDocument();
    expect(screen.getByText(`${fullMock.amount}`)).toBeInTheDocument();

    expect(screen.getByText(t('Recipient'))).toBeInTheDocument();
    const partyLink = screen.getByText(`${fullMock.targetPartyId}`);
    expect(partyLink).toBeInTheDocument();
    if (!partyLink.parentElement) {
      throw new Error('Party link does not exist');
    }
    expect(partyLink.tagName).toEqual('A');
    expect(partyLink.getAttribute('href')).toEqual(
      `/parties/${fullMock.targetPartyId}`
    );

    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.parentElement.textContent).toEqual(fullMock.vegaAssetId);

    expect(screen.getByText(t('Source'))).toBeInTheDocument();
    const ethLink = screen.getByText(`${fullMock.sourceEthereumAddress}`);
    if (!ethLink.parentElement) {
      throw new Error('ETH link does not exist');
    }
    expect(ethLink.parentElement.getAttribute('href')).toContain(
      `/address/${fullMock.sourceEthereumAddress}`
    );
  });
});
