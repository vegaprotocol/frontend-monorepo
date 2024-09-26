import { screen, render } from '@testing-library/react';
import {
  TxDetailsLiquidityAmendment,
  type TxDetailsLiquidityAmendmentProps,
} from './tx-liquidity-amend';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { MockExplorerEpochForBlockBlank } from '../../../mocks/links';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

jest.mock('../../../components/links/');
jest.mock('../../../components/price-in-market/price-in-market');

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

  const renderComponent = (props: TxDetailsLiquidityAmendmentProps) => {
    return render(
      <MockedProvider mocks={[MockExplorerEpochForBlockBlank]}>
        <MemoryRouter>
          <TooltipProvider>
            <TxDetailsLiquidityAmendment {...props} />
          </TooltipProvider>
        </MemoryRouter>
      </MockedProvider>
    );
  };

  it('should render the component with correct data', () => {
    renderComponent({
      txData: mockTxData as BlockExplorerTransactionResult,
      pubKey: mockPubKey,
      blockData: mockBlockData as TendermintBlocksResponse,
    });

    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('Commitment amount')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Fee')).toBeInTheDocument();
    expect(screen.getByText('1%')).toBeInTheDocument();
  });

  it('should display awaiting message when tx data is undefined', () => {
    renderComponent({
      txData: undefined,
      pubKey: mockPubKey,
      blockData: mockBlockData as TendermintBlocksResponse,
    });

    expect(
      screen.getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });

  it('should display awaiting message when liquidityProvisionAmendment is undefined', () => {
    renderComponent({
      txData: { command: {} } as BlockExplorerTransactionResult,
      pubKey: mockPubKey,
      blockData: mockBlockData as TendermintBlocksResponse,
    });

    expect(
      screen.getByText('Awaiting Block Explorer transaction details')
    ).toBeInTheDocument();
  });
});
