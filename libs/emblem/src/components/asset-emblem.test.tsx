import { render } from '@testing-library/react';
import { EmblemByAsset } from './asset-emblem';
import React from 'react';

describe('EmblemByAsset', () => {
  it('should render successfully', () => {
    const props = {
      vegaChain: 'vega-chain',
      asset: '123',
      alt: 'Emblem',
    };

    const { getByAltText } = render(<EmblemByAsset {...props} />);

    const emblemImage = getByAltText('Emblem');

    expect(emblemImage).toBeInTheDocument();
    expect(emblemImage).toHaveAttribute(
      'src',
      'https://icon.vega.xyz/vega/vega-chain/asset/123/logo.svg'
    );
  });

  it('should use default vega chain if vegaChain prop is not provided', () => {
    const props = {
      asset: '123',
    };

    const { getByAltText } = render(<EmblemByAsset {...props} />);

    const emblemImage = getByAltText('Emblem');

    expect(emblemImage).toBeInTheDocument();
    expect(emblemImage).toHaveAttribute(
      'src',
      'https://icon.vega.xyz/vega/vega-mainnet-0011/asset/123/logo.svg'
    );
  });
});
