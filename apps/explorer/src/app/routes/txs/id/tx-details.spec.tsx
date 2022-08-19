import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { truncateByChars } from '@vegaprotocol/react-helpers';
import { TxDetails, txDetailsTruncateLength } from './tx-details';
import type { Result } from '../tendermint-transaction-response.d';

const pubKey = 'test';
const hash = '7416753A30622A9E24A06F0172D6C33A95186B36806D96345C6DC5A23FA3F283';
const height = '52987';
const tx =
  'ClMIpeWjmKnn77FNEPedA5J9QhJAOGI3YjQzMWNlMmNhNzc4MWMzMTQ1M2IyYjc0MWYwMTJlNzQ1MzBhZDhjMDgzODVkMWQ1YjRiY2VkMTJiNDc1MhKTAQqAATM5NDFlNmExMzQ3MGVhNTlhNGExNmQzMjRiYzlkZjI5YWZkMzYxMDRiZjQ5MzEwZWMxM2ZiOTMxNTM2NGY3ZjU2ZTQyOTJmYTAyZDlhNTBlZDc0OWE0ZjExMzJiNjM2ZTZmMzQ3YzQ2NjdkYmM5OThmYzcyZjYzYzQxMzU4ZTAzEgx2ZWdhL2VkMjU1MTkYAYB9AtI+QDA5MzFhOGZkOGNjOTM1NDU4ZjQ3MGU0MzVhMDU0MTQzODdjZWE2ZjMyOWQ2NDhiZTg5NGZjZDQ0YmQ1MTdhMmI=';

const txData = {
  hash,
  height,
  tx,
  index: 0,
  tx_result: {
    code: 0,
    data: null,
    log: '',
    info: '',
    events: [],
    gas_wanted: '0',
    gas_used: '0',
    codespace: '',
  },
};

const renderComponent = (txData: Result) => (
  <Router>
    <TxDetails txData={txData} pubKey={pubKey} />
  </Router>
);

describe('Transaction details', () => {
  it('Renders the tx hash', () => {
    render(renderComponent(txData));
    expect(screen.getByText(hash)).toBeInTheDocument();
  });

  it('Renders the pubKey', () => {
    render(renderComponent(txData));
    expect(screen.getByText(pubKey)).toBeInTheDocument();
  });

  it('Renders the height', () => {
    render(renderComponent(txData));
    expect(screen.getByText(height)).toBeInTheDocument();
  });

  it('Renders the truncated tx text', () => {
    render(renderComponent(txData));
    expect(
      screen.getByText(
        truncateByChars(tx, txDetailsTruncateLength, txDetailsTruncateLength)
      )
    ).toBeInTheDocument();
  });

  it('Renders a copy button', () => {
    render(renderComponent(txData));
    expect(screen.getByTestId('copy-tx-to-clipboard')).toBeInTheDocument();
  });
});
