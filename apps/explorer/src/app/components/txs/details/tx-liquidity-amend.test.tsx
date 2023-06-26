import { render } from '@testing-library/react';
import { TxDetailsLiquidityAmendment } from './tx-liquidity-amend';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

describe('TxDetailsLiquidityAmendment', () => {
  const mockTxData = {
    hash: 'test',
    command: {
      liquidityProvisionAmendment: {
        marketId: 'BTC-USD',
        commitmentAmount: 100,
        fee: '0.01',
      },
    },
  };
  const mockPubKey = '123';
  const mockBlockData = {
    result: {
      block: {
        header: {
          height: '123',
        },
      },
    },
  };

  it('should render the component with correct data', () => {
    const { getByText } = render(
      <MockedProvider>
        <MemoryRouter>
          <TxDetailsLiquidityAmendment
            txData={mockTxData as BlockExplorerTransactionResult}
            pubKey={mockPubKey}
            blockData={mockBlockData as TendermintBlocksResponse}
          />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(getByText('Market')).toBeInTheDocument();
    expect(getByText('BTC-USD')).toBeInTheDocument();
    expect(getByText('Commitment amount')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('Fee')).toBeInTheDocument();
    expect(getByText('1%')).toBeInTheDocument();
  });

  it('should display awaiting message when tx data is undefined', () => {
    const { getByText } = render(
      <MockedProvider>
        <MemoryRouter>
          <TxDetailsLiquidityAmendment
            txData={undefined}
            pubKey={mockPubKey}
            blockData={mockBlockData as TendermintBlocksResponse}
          />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(
      getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });

  it('should display awaiting message when liquidityProvisionAmendment is undefined', () => {
    const { getByText } = render(
      <MockedProvider>
        <MemoryRouter>
          <TxDetailsLiquidityAmendment
            txData={{ command: {} } as BlockExplorerTransactionResult}
            pubKey={mockPubKey}
            blockData={mockBlockData as TendermintBlocksResponse}
          />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(
      getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });
});
