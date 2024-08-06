import { render } from '@testing-library/react';
import React from 'react';

import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';

import { WalletsRoot } from './index';

jest.mock('@/stores/wallets');

describe('WalletsRoot Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component without errors when loading is false', () => {
    mockStore(useWalletStore, { loading: false });

    const { container } = render(<WalletsRoot />);

    expect(container).toBeDefined();
  });

  it('should not render anything when loading is true', () => {
    mockStore(useWalletStore, { loading: true });

    const { container } = render(<WalletsRoot />);

    expect(container).toBeEmptyDOMElement();
  });
});
