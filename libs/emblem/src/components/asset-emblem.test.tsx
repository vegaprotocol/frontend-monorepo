import { render, screen } from '@testing-library/react';
import { EmblemByAsset } from './asset-emblem';
import React from 'react';

describe('EmblemByAsset', () => {
  const assetId =
    '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1';

  it('should render successfully', () => {
    const props = {
      asset: assetId,
    };

    render(<EmblemByAsset {...props} />);

    expect(screen.getByTitle('USDT logo')).toBeInTheDocument();
  });

  it('renders a source chain icon if provided', () => {
    const props = {
      asset: assetId,
      chain: '1',
    };

    render(<EmblemByAsset {...props} />);

    expect(screen.getByTitle('USDT logo')).toBeInTheDocument();
    expect(screen.getByTitle('Ethereum logo')).toBeInTheDocument();
  });
});
