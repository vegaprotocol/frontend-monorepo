import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { TxDetails } from './tx-details';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';

const pubKey = 'test';
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
  command: {},
};

const renderComponent = (txData: BlockExplorerTransactionResult) => (
  <Router>
    <TxDetails txData={txData} pubKey={pubKey} />
  </Router>
);

describe('Transaction details', () => {
  it('Renders the pubKey', () => {
    render(renderComponent(txData));
    expect(screen.getByText(pubKey)).toBeInTheDocument();
  });

  it('Renders the height', () => {
    render(renderComponent(txData));
    expect(screen.getByText(height)).toBeInTheDocument();
  });
});
