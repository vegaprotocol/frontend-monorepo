import React from 'react';
import { render } from '@testing-library/react';
import { Emblem } from './emblem';
import type { EmblemByAssetProps } from './asset-emblem';
import type { EmblemByContractProps } from './contract-emblem';

describe('Emblem', () => {
  it('renders EmblemByAsset component when props are of type EmblemByAsset (including chain)', () => {
    const props: EmblemByAssetProps = {
      asset: '123',
      vegaChain: 'mainnet',
    };

    const { getByTestId } = render(<Emblem {...props} />);
    const emblemByAssetComponent = getByTestId('emblem-by-asset');

    expect(emblemByAssetComponent).toBeInTheDocument();
  });

  it('renders EmblemByAsset component when props are of type EmblemByAsset (excluding chain)', () => {
    const props: EmblemByAssetProps = {
      asset: '123',
    };

    const { getByTestId } = render(<Emblem {...props} />);
    const emblemByAssetComponent = getByTestId('emblem-by-asset');

    expect(emblemByAssetComponent).toBeInTheDocument();
  });

  it('renders EmblemByContract component when props are of type EmblemByContract (including chain)', () => {
    const props: EmblemByContractProps = {
      contract: '456',
      chainId: '1',
    };

    const { getByTestId } = render(<Emblem {...props} />);
    const emblemByContractComponent = getByTestId('emblem-by-contract');

    expect(emblemByContractComponent).toBeInTheDocument();
  });

  it('renders EmblemByContract component when props are of type EmblemByContract (excluding chain)', () => {
    const props: EmblemByContractProps = {
      contract: '456',
    };

    const { getByTestId } = render(<Emblem {...props} />);
    const emblemByContractComponent = getByTestId('emblem-by-contract');

    expect(emblemByContractComponent).toBeInTheDocument();
  });
});
