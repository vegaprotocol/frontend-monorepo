import { fireEvent, render, screen } from '@testing-library/react';
import { ProposalUpdateMarketState } from './proposal-update-market-state';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { MarketUpdateType } from '@vegaprotocol/types';

describe('<ProposalUpdateMarketState />', () => {
  const suspendProposal = generateProposal({
    terms: {
      change: {
        __typename: 'UpdateMarketState',
        market: {
          id: '1',
          decimalPlaces: 0,
          tradableInstrument: {
            instrument: {
              name: 'suspendProposal Name',
              code: 'suspendProposal Code',
              product: {
                __typename: 'Future',
                quoteName: 'USD',
              },
            },
          },
        },
        updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_SUSPEND,
      },
    },
  });

  const resumeProposal = generateProposal({
    terms: {
      change: {
        __typename: 'UpdateMarketState',
        market: {
          id: '1',
          decimalPlaces: 0,
          tradableInstrument: {
            instrument: {
              name: 'resumeProposal Name',
              code: 'resumeProposal Code',
              product: {
                __typename: 'Future',
                quoteName: 'USD',
              },
            },
          },
        },
        updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_RESUME,
      },
    },
  });

  const terminateProposal = generateProposal({
    terms: {
      change: {
        __typename: 'UpdateMarketState',
        market: {
          id: '1',
          decimalPlaces: 0,
          tradableInstrument: {
            instrument: {
              name: 'terminateProposal Name',
              code: 'terminateProposal Code',
              product: {
                __typename: 'Future',
                quoteName: 'USD',
              },
            },
          },
        },
        updateType: MarketUpdateType.MARKET_STATE_UPDATE_TYPE_TERMINATE,
        price: '123',
      },
    },
  });

  it('should render nothing if proposal is null', () => {
    render(<ProposalUpdateMarketState proposal={null} />);
    expect(screen.queryByTestId('proposal-update-market-state')).toBeNull();
  });

  it('should toggle details when CollapsibleToggle is clicked', () => {
    render(<ProposalUpdateMarketState proposal={suspendProposal} />);

    expect(
      screen.queryByTestId('proposal-update-market-state-table')
    ).toBeNull();

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(
      screen.getByTestId('proposal-update-market-state-table')
    ).toBeInTheDocument();
  });

  it('should display suspend market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState proposal={suspendProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('suspendProposal Name')).toBeInTheDocument();
    expect(screen.getByText('suspendProposal Code')).toBeInTheDocument();
  });

  it('should display resume market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState proposal={resumeProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('resumeProposal Name')).toBeInTheDocument();
    expect(screen.getByText('resumeProposal Code')).toBeInTheDocument();
  });

  it('should display terminate market information when showDetails is true', () => {
    render(<ProposalUpdateMarketState proposal={terminateProposal} />);

    fireEvent.click(screen.getByTestId('proposal-market-data-toggle'));

    expect(screen.getByText('terminateProposal Name')).toBeInTheDocument();
    expect(screen.getByText('terminateProposal Code')).toBeInTheDocument();
    expect(screen.getByText('123 USD')).toBeInTheDocument();
  });
});
