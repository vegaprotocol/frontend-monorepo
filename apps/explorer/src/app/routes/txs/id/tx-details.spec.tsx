import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { TxDetails } from './tx-details';
import type {
  BlockExplorerTransactionResult,
  ValidatorHeartbeat,
} from '../../../routes/types/block-explorer-response';

// Note: Long enough that there is a truncated output and a full output
const pubKey =
  '67755549e43e95f0697f83b2bf419c6ccc18eee32a8a61b8ba6f59471b86fbef';
const hash = '7416753A30622A9E24A06F0172D6C33A95186B36806D96345C6DC5A23FA3F283';
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
    value: '123',
  },
};

const renderComponent = (txData: BlockExplorerTransactionResult) => (
  <Router>
    <TxDetails txData={txData} pubKey={pubKey} />
  </Router>
);

describe('Transaction details', () => {
  it('Renders the details common to all txs', () => {
    render(renderComponent(txData));
    expect(screen.getByText(pubKey)).toBeInTheDocument();
    expect(screen.getByText(hash)).toBeInTheDocument();
  });
});
