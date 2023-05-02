import { render, screen } from '@testing-library/react';
import { MarketState } from '@vegaprotocol/types';
import { addDays, subDays } from 'date-fns';
import type { SettlementDataCellProps } from './settlement-date-cell';
import { SettlementDateCell } from './settlement-date-cell';

describe('SettlementDateCell', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;

  const createProps = (): SettlementDataCellProps => {
    return {
      oracleSpecId: 'oracle-spec-id',
      metaDate: null,
      closeTimestamp: null,
      marketState: MarketState.STATE_SETTLED,
    };
  };

  beforeAll(() => {
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(mockNowTimestamp);
  });

  afterAll(() => {
    Date.now = originalNow;
  });

  it('renders unknown if date cannot be determined', () => {
    const props = createProps();
    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Unknown');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders using close timestamp if provided', () => {
    const daysAgo = 3;
    const props = createProps();
    props.closeTimestamp = subDays(
      new Date(mockNowTimestamp),
      daysAgo
    ).toISOString();

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders using meta tag date if no close timestamp provided', () => {
    const daysAgo = 4;
    const props = createProps();
    props.metaDate = subDays(new Date(mockNowTimestamp), daysAgo);

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders past expected settlement date', () => {
    const daysAgo = 3;
    const props = createProps();
    props.metaDate = subDays(new Date(mockNowTimestamp), daysAgo);
    props.marketState = MarketState.STATE_TRADING_TERMINATED;

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`Expected ${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders future expected settlement date', () => {
    const daysAgo = 3;
    const props = createProps();
    props.metaDate = addDays(new Date(mockNowTimestamp), daysAgo);
    props.marketState = MarketState.STATE_TRADING_TERMINATED;

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`Expected in ${daysAgo} days`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });
});
