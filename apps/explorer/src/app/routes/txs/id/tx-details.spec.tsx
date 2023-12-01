import { render, screen } from '@testing-library/react';
import { TxDetails } from './tx-details';
import type {
  BlockExplorerTransactionResult,
  ValidatorHeartbeat,
} from '../../../routes/types/block-explorer-response';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

// Note: Long enough that there is a truncated output and a full output
const pubKey =
  '67755549e43e95f0697f83b2bf419c6ccc18eee32a8a61b8ba6f59471b86fbef';
const hash = '7416753a30622a9e24a06f0172d6c33a95186b36806d96345c6dc5a23fa3f283';
const height = '52987';

const txData: BlockExplorerTransactionResult = {
  hash,
  block: height,
  index: 0,
  submitter: pubKey,
  code: 0,
  cursor: `${height}.0`,
  type: 'type',
  command: {} as ValidatorHeartbeat,
  signature: {
    version: '1',
    algo: 'vega/ed25519',
    value: '123',
  },
};

const renderComponent = (txData: BlockExplorerTransactionResult) => (
  <MemoryRouter>
    <MockedProvider>
      <TxDetails txData={txData} pubKey={pubKey} />
    </MockedProvider>
  </MemoryRouter>
);

describe('Transaction details', () => {
  it('Renders the details common to all txs', () => {
    render(renderComponent(txData));
    expect(screen.getByText(pubKey)).toBeInTheDocument();
    expect(screen.getByText(hash)).toBeInTheDocument();
  });
});
