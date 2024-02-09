import { render, screen } from '@testing-library/react';
import { BatchItem } from './batch-item';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { components } from '../../../../../types/explorer';
type Item = components['schemas']['vegaBatchProposalTermsChange'];

describe('BatchItem', () => {
  it('Renders "Unknown proposal type" by default', () => {
    const item = {};
    render(<BatchItem item={item} />);
    expect(screen.getByText('Unknown proposal type')).toBeInTheDocument();
  });

  it('Renders "Unknown proposal type" for unknown items', () => {
    const item = {
      newLochNessMonster: {
        location: 'Loch Ness',
      },
    } as unknown as Item;
    render(<BatchItem item={item} />);
    expect(screen.getByText('Unknown proposal type')).toBeInTheDocument();
  });

  it('Renders "New spot market"', () => {
    const item = {
      newSpotMarket: {},
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('New spot market')).toBeInTheDocument();
  });

  it('Renders "Cancel transfer"', () => {
    const item = {
      cancelTransfer: {
        changes: {
          transferId: 'transfer123',
        },
      },
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('Cancel transfer')).toBeInTheDocument();
    expect(screen.getByText('transf')).toBeInTheDocument();
  });

  it('Renders "Cancel transfer" without an id', () => {
    const item = {
      cancelTransfer: {
        changes: {},
      },
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('Cancel transfer')).toBeInTheDocument();
  });

  it('Renders "New freeform"', () => {
    const item = {
      newFreeform: {},
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('New freeform proposal')).toBeInTheDocument();
  });

  it('Renders "New market"', () => {
    const item = {
      newMarket: {},
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('New market')).toBeInTheDocument();
  });

  it('Renders "New transfer"', () => {
    const item = {
      newTransfer: {},
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('New transfer')).toBeInTheDocument();
  });

  it('Renders "Update asset" with assetId', () => {
    const item = {
      updateAsset: {
        assetId: 'asset123',
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update asset')).toBeInTheDocument();
    expect(screen.getByText('asset123')).toBeInTheDocument();
  });

  it('Renders "Update asset" even if assetId is not set', () => {
    const item = {
      updateAsset: {
        assetId: undefined,
      },
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('Update asset')).toBeInTheDocument();
  });

  it('Renders "Update market state" with marketId', () => {
    const item = {
      updateMarketState: {
        changes: {
          marketId: 'market123',
        },
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update market state')).toBeInTheDocument();
    expect(screen.getByText('market123')).toBeInTheDocument();
  });

  it('Renders "Update market state" even if marketId is not set', () => {
    const item = {
      updateMarketState: {
        changes: {
          marketId: undefined,
        },
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update market state')).toBeInTheDocument();
  });

  it('Renders "Update network parameter" with parameter', () => {
    const item = {
      updateNetworkParameter: {
        changes: {
          key: 'parameter123',
        },
      },
    };
    render(
      <MockedProvider>
        <MemoryRouter>
          <BatchItem item={item} />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByText('Update network parameter')).toBeInTheDocument();
    expect(screen.getByText('parameter123')).toBeInTheDocument();
  });

  it('Renders "Update network parameter" even if parameter is not set', () => {
    const item = {
      updateNetworkParameter: {
        changes: {
          key: undefined,
        },
      },
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('Update network parameter')).toBeInTheDocument();
  });

  it('Renders "Update referral program"', () => {
    const item = {
      updateReferralProgram: {},
    };
    render(<BatchItem item={item} />);
    expect(screen.getByText('Update referral program')).toBeInTheDocument();
  });

  it('Renders "Update spot market" with marketId', () => {
    const item = {
      updateSpotMarket: {
        marketId: 'market123',
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update spot market')).toBeInTheDocument();
    expect(screen.getByText('market123')).toBeInTheDocument();
  });

  it('Renders "Update spot market" even if marketId is not set', () => {
    const item = {
      updateSpotMarket: {
        marketId: undefined,
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update spot market')).toBeInTheDocument();
  });
  it('Renders "Update market" with marketId', () => {
    const item = {
      updateMarket: {
        marketId: 'market123',
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update market')).toBeInTheDocument();
    expect(screen.getByText('market123')).toBeInTheDocument();
  });

  it('Renders "Update market" even if marketId is not set', () => {
    const item = {
      updateMarket: {
        marketId: undefined,
      },
    };
    render(
      <MemoryRouter>
        <MockedProvider>
          <BatchItem item={item} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Update market')).toBeInTheDocument();
  });

  it('Renders "Update volume discount program"', () => {
    const item = {
      updateVolumeDiscountProgram: {},
    };
    render(<BatchItem item={item} />);
    expect(
      screen.getByText('Update volume discount program')
    ).toBeInTheDocument();
  });
});
