import { fireEvent, render, screen } from '@testing-library/react';
import { ProposalUpdateMarketState } from './proposal-update-market-state';
import { MarketUpdateType } from '@vegaprotocol/types';

describe('<ProposalUpdateMarketState />', () => {
  const suspendProposal = {
    __typename: 'UpdateMarketState' as const,
    market: {
      id: '1',
      decimalPlaces: 0,
      tradableInstrument: {
        instrument: {
          name: 'suspendProposal Name',
          code: 'suspendProposal Code',
          product: {
            __typename: 'Future' as const,
            quoteName: 'USD',
          },
        },
      },
    },
    updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_SUSPEND,
  };

  const resumeProposal = {
    __typename: 'UpdateMarketState' as const,
    market: {
      id: '1',
      decimalPlaces: 0,
      tradableInstrument: {
        instrument: {
          name: 'resumeProposal Name',
          code: 'resumeProposal Code',
          product: {
            __typename: 'Future' as const,
            quoteName: 'USD',
          },
        },
      },
    },
    updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_RESUME,
  };

  const terminateProposal = {
    __typename: 'UpdateMarketState' as const,
    market: {
      id: '1',
      decimalPlaces: 0,
      tradableInstrument: {
        instrument: {
          name: 'terminateProposal Name',
          code: 'terminateProposal Code',
          product: {
            __typename: 'Future' as const,
            quoteName: 'USD',
          },
        },
      },
    },
    updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
    price: '123',
  };

  it('should render nothing if proposal is null', () => {
    render(<ProposalUpdateMarketState change={null} />);
    expect(screen.queryByTestId('proposal-update-market-state')).toBeNull();
  });

  it('should toggle details when CollapsibleToggle is clicked', () => {
    render(<ProposalUpdateMarketState change={suspendProposal} />);

    expect(
      screen.queryByTestId('proposal-update-market-state-table')
    ).toBeNull();

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(
      screen.getByTestId('proposal-update-market-state-table')
    ).toBeInTheDocument();
  });

  it('should display suspend market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState change={suspendProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('suspendProposal Name')).toBeInTheDocument();
    expect(screen.getByText('suspendProposal Code')).toBeInTheDocument();
  });

  it('should display resume market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState change={resumeProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('resumeProposal Name')).toBeInTheDocument();
    expect(screen.getByText('resumeProposal Code')).toBeInTheDocument();
  });

  it('should display terminate market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState change={terminateProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('terminateProposal Name')).toBeInTheDocument();
    expect(screen.getByText('terminateProposal Code')).toBeInTheDocument();
    expect(screen.getByText('123 USD')).toBeInTheDocument();
  });
});
