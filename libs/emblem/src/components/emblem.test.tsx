import React from 'react';
import { render } from '@testing-library/react';
import { Emblem } from './emblem';

describe('Emblem', () => {
  it('renders EmblemByAsset component when props are of type EmblemByAsset (including chain)', () => {
    const props = {
      asset: '123',
      vegaChain: 'mainnet',
      alt: 'Emblem',
    };

    const { getByAltText } = render(
      <Emblem data-testId="emblem-by-asset" {...props} />
    );
    const emblemByAssetComponent = getByAltText('Emblem');

    expect(emblemByAssetComponent).toBeInTheDocument();
    expect(emblemByAssetComponent.getAttribute('src')).toContain('asset');
    expect(emblemByAssetComponent.getAttribute('src')).not.toContain('chain');
  });

  it('renders EmblemByAsset component when props are of type EmblemByAsset (excluding chain)', () => {
    const props = {
      asset: '123',
      alt: 'Emblem',
    };

    const { getByAltText } = render(
      <Emblem data-testId="emblem-by-asset" {...props} />
    );
    const emblemByAssetComponent = getByAltText('Emblem');

    expect(emblemByAssetComponent).toBeInTheDocument();
    expect(emblemByAssetComponent.getAttribute('src')).toContain('asset');
    expect(emblemByAssetComponent.getAttribute('src')).not.toContain('chain');
  });

  it('renders EmblemByContract component when props are of type EmblemByContract (including chain)', () => {
    const props = {
      contract: '456',
      chainId: '1',
      alt: 'Emblem',
    };

    const { getByAltText } = render(
      <Emblem data-testId="emblem-by-contract" {...props} />
    );
    const emblemByContractComponent = getByAltText('Emblem');

    expect(emblemByContractComponent).toBeInTheDocument();
    expect(emblemByContractComponent.getAttribute('src')).toContain('chain');
    expect(emblemByContractComponent.getAttribute('src')).not.toContain(
      '/vega/'
    );
  });

  it('renders EmblemByContract component when props are of type EmblemByContract (excluding chain)', () => {
    const props = {
      contract: '456',
      alt: 'Emblem',
    };

    const { getByAltText } = render(
      <Emblem data-testId="emblem-by-contract" {...props} />
    );
    const emblemByContractComponent = getByAltText('Emblem');

    expect(emblemByContractComponent).toBeInTheDocument();
    expect(emblemByContractComponent.getAttribute('src')).toContain('chain');
    expect(emblemByContractComponent.getAttribute('src')).not.toContain(
      '/vega/'
    );
  });
});
