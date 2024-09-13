import React from 'react';
import { screen, render } from '@testing-library/react';
import { Emblem } from './emblem';

describe('Emblem', () => {
  const assetId =
    '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1';

  it('renders EmblemByAsset component when props are of type EmblemByAsset (including chain)', () => {
    const props = {
      asset: assetId,
      chain: '1',
    };

    render(<Emblem {...props} />);
    expect(screen.getAllByTitle(/logo/)).toHaveLength(2);
  });

  it('renders a fallback when no icon is found', () => {
    const props = {
      asset: 'nothing',
    };

    render(<Emblem {...props} />);
    expect(screen.queryByTitle(/logo/i)).not.toBeInTheDocument();
    expect(screen.getByTitle(/fallback/i)).toBeInTheDocument();
  });

  it('renders EmblemByAsset component when props are of type EmblemByAsset (excluding chain)', () => {
    const props = {
      asset: assetId,
    };

    render(<Emblem {...props} />);
    const title = screen.getByTitle(/logo/i);
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('USDT logo');
  });

  it('sets a default width and height if not provided', () => {
    const props = {
      asset: assetId,
    };

    render(<Emblem {...props} />);
    const title = screen.getByTitle(/logo/i);
    const svg = title.closest('svg');

    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('allows the default width and height to be overridden', () => {
    const props = {
      asset: assetId,
      size: 100,
    };

    render(<Emblem {...props} />);

    const title = screen.getByTitle(/logo/i);
    const svg = title.closest('svg');

    expect(svg).toHaveAttribute('width', String(props.size));
    expect(svg).toHaveAttribute('height', String(props.size));
  });

  it('passes through classnames', () => {
    const props = {
      asset: assetId,
      className: 'test-class',
    };

    render(<Emblem {...props} />);

    const title = screen.getByTitle(/logo/i);
    const element = title.closest('span');

    expect(element).toHaveClass('test-class');
  });
});
