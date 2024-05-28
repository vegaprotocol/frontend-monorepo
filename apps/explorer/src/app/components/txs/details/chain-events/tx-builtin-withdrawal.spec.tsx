import { render } from '@testing-library/react';
import { TxDetailsChainEventBuiltinWithdrawal } from './tx-builtin-withdrawal';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import omit from 'lodash/omit';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

type Withdrawal = components['schemas']['vegaBuiltinAssetWithdrawal'];

const fullMock: Withdrawal = {
  partyId: '0000000000000000000000000000000000000000000000000000000000000001',
  vegaAssetId: 'asset123',
  amount: 'amount123',
};

jest.mock('../../../links/');

describe('Chain Event: Builtin asset withdrawal', () => {
  it('Renders nothing if no good data is provided', () => {
    const mock = undefined as unknown as Withdrawal;
    const screen = render(
      <TxDetailsChainEventBuiltinWithdrawal withdrawal={mock} />
    );

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('Renders nothing if correct type with no data is provided', () => {
    const mock: Withdrawal = {};

    const screen = render(
      <TxDetailsChainEventBuiltinWithdrawal withdrawal={mock} />
    );
    expect(screen.container).toBeEmptyDOMElement();
  });

  it(`Renders nothing if correct type with partial data is provided`, () => {
    for (const key in fullMock) {
      const mock = omit(fullMock, key);
      const screen = render(
        <TxDetailsChainEventBuiltinWithdrawal withdrawal={mock} />
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
              <TxDetailsChainEventBuiltinWithdrawal withdrawal={fullMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('Built-in asset withdrawal'))
    ).toBeInTheDocument();
    expect(screen.getByText(t('Asset'))).toBeInTheDocument();
    expect(screen.getByText(`${fullMock.vegaAssetId}`)).toBeInTheDocument();
    expect(screen.getByText(t('Amount'))).toBeInTheDocument();
    expect(screen.getByText(`${fullMock.amount}`)).toBeInTheDocument();

    expect(screen.getByText(t('Recipient'))).toBeInTheDocument();

    const partyLink = screen.getByText(`${fullMock.partyId}`);
    if (!partyLink.parentElement) {
      throw new Error('Party link does not exist');
    }

    expect(partyLink.tagName).toEqual('A');
    expect(partyLink.getAttribute('href')).toEqual(
      `/parties/${fullMock.partyId}`
    );

    const assetLink = screen.getByText(`${fullMock.vegaAssetId}`);
    expect(assetLink).toBeInTheDocument();
    if (!assetLink.parentElement) {
      throw new Error('Asset link does not exist');
    }
    expect(assetLink.textContent).toEqual(fullMock.vegaAssetId);
  });
});
