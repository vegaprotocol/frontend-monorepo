import { render } from '@testing-library/react';
import { EmblemByContract } from './contract-emblem';
import React from 'react';

describe('EmblemByContract', () => {
  it('should render successfully', () => {
    const props = {
      vegaChain: 'custom-chain',
      contract: '123',
      alt: 'Emblem',
    };

    const { getByAltText } = render(<EmblemByContract {...props} />);

    const emblemImage = getByAltText('Emblem');

    expect(emblemImage).toBeInTheDocument();
    expect(emblemImage).toHaveAttribute(
      'src',
      'https://icon.vega.xyz/chain/custom-chain/asset/123/logo.svg'
    );
  });

  it('should use default vega chain if vegaChain prop is not provided', () => {
    const props = {
      contract: '123',
      alt: 'Emblem',
    };

    const { getByAltText } = render(<EmblemByContract {...props} />);

    const emblemImage = getByAltText('Emblem');

    expect(emblemImage).toBeInTheDocument();
    expect(emblemImage).toHaveAttribute(
      'src',
      'https://icon.vega.xyz/chain/vega-mainnet-0011/asset/123/logo.svg'
    );
  });
});
