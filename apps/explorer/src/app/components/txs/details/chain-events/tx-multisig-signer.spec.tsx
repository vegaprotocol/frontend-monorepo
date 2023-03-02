import { render } from '@testing-library/react';
import { t } from '@vegaprotocol/i18n';

import type { components } from '../../../../../types/explorer';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { TxDetailsChainMultisigSigner } from './tx-multisig-signer';
import { getBlockTime } from './lib/get-block-time';

type Added = components['schemas']['vegaERC20SignerAdded'];
type Removed = components['schemas']['vegaERC20SignerRemoved'];

const mockBlockTime = '1669631323';

describe('Chain Event: multisig signer change', () => {
  it('Copes with a poorly formatted time prop', () => {
    const addedMock: Added = {
      newSigner: 'eth123',
      nonce: 'nonce123',
      blockTime: 'you shall not parse',
    };
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainMultisigSigner signer={addedMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Signer change at'))).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('Renders addedSigner correctly', () => {
    const addedMock: Added = {
      newSigner: 'eth123',
      nonce: 'nonce123',
      blockTime: mockBlockTime,
    };
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainMultisigSigner signer={addedMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('Add ERC20 bridge multisig signer'))
    ).toBeInTheDocument();

    expect(screen.getByText(t('Add signer'))).toBeInTheDocument();
    expect(screen.getByText(`${addedMock.newSigner}`)).toBeInTheDocument();

    const expectedDate = getBlockTime(mockBlockTime);

    expect(screen.getByText(t('Signer change at'))).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('Renders TableRows if all data is provided', () => {
    const removedMock: Removed = {
      oldSigner: 'eth123',
      nonce: 'nonce123',
      blockTime: mockBlockTime,
    };
    const screen = render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxDetailsChainMultisigSigner signer={removedMock} />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText(t('Chain event type'))).toBeInTheDocument();
    expect(
      screen.getByText(t('Remove ERC20 bridge multisig signer'))
    ).toBeInTheDocument();

    expect(screen.getByText(t('Remove signer'))).toBeInTheDocument();
    expect(screen.getByText(`${removedMock.oldSigner}`)).toBeInTheDocument();

    const expectedDate = getBlockTime(mockBlockTime);

    expect(screen.getByText(t('Signer change at'))).toBeInTheDocument();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });
});
