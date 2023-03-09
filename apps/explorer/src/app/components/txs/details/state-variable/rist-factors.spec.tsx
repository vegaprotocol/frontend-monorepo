import { getValues, StateVariableProposalRiskFactors } from './risk-factors';
import type { components } from '../../../../../types/explorer';
import { render } from '@testing-library/react';

type kvb = components['schemas']['vegaKeyValueBundle'][];

describe('Risk Factors: getValues', () => {
  it('returns null if null is passed in', () => {
    const res = getValues(null as unknown as kvb);
    expect(res).toBeNull();
  });

  it('returns a blank template if kvb is empty', () => {
    const res = getValues([]);
    expect(res).not.toBeNull();
    expect(res?.bid.offsetTolerance).toEqual('-');
    expect(res?.bid.probabilityTolerance).toEqual('-');
    expect(res?.bid.probability).toEqual([]);
    expect(res?.bid.offset).toEqual([]);
    expect(res?.bid.rows.length).toEqual(0);

    expect(res?.ask.offsetTolerance).toEqual('-');
    expect(res?.ask.probabilityTolerance).toEqual('-');
    expect(res?.ask.probability).toEqual([]);
    expect(res?.ask.offset).toEqual([]);
    expect(res?.ask.rows.length).toEqual(0);
  });

  it('parses out a correct bid offset and probability', () => {
    const k: kvb = [
      {
        key: 'bidOffset',
        value: { vectorVal: { value: ['1'] } },
      },
      {
        key: 'bidProbability',
        value: { vectorVal: { value: ['2'] } },
      },
    ];

    const res = getValues(k);
    expect(res?.bid.offset).toEqual(['1']);
    expect(res?.bid.probability).toEqual(['2']);
    expect(res?.bid.rows).toEqual([['1', '2']]);
  });

  it('parses out a correct ask offset and probability', () => {
    const k: kvb = [
      {
        key: 'askOffset',
        value: { vectorVal: { value: ['1'] } },
      },
      {
        key: 'askProbability',
        value: { vectorVal: { value: ['2'] } },
      },
    ];

    const res = getValues(k);
    expect(res?.ask.offset).toEqual(['1']);
    expect(res?.ask.probability).toEqual(['2']);
    expect(res?.ask.rows).toEqual([['1', '2']]);
  });

  it('parses out a correct ask/bid offset and probability', () => {
    const k: kvb = [
      {
        key: 'askOffset',
        value: { vectorVal: { value: ['1'] } },
      },
      {
        key: 'askProbability',
        value: { vectorVal: { value: ['2'] } },
      },
      {
        key: 'bidOffset',
        value: { vectorVal: { value: ['3'] } },
      },
      {
        key: 'bidProbability',
        value: { vectorVal: { value: ['4'] } },
      },
    ];

    const res = getValues(k);
    expect(res?.ask.rows).toEqual([['1', '2']]);
    expect(res?.bid.rows).toEqual([['3', '4']]);
  });
});

describe('Risk Factors: component', () => {
  it('renders 3 rows correctly', () => {
    const k: kvb = [
      {
        key: 'askOffset',
        value: { vectorVal: { value: ['1.1', '1.2', '1.3'] } },
      },
      {
        key: 'askProbability',
        value: { vectorVal: { value: ['2.2', '2.3', '2.4'] } },
      },
      {
        key: 'bidOffset',
        value: { vectorVal: { value: ['1.1', '1.2', '1.3'] } },
      },
      {
        key: 'bidProbability',
        value: { vectorVal: { value: ['4.4', '4.5', '4.6'] } },
      },
    ];

    const screen = render(<StateVariableProposalRiskFactors kvb={k} />);
    expect(screen.getByText('Mid offset')).toBeInTheDocument();
    expect(screen.getByText('Bid probability')).toBeInTheDocument();
    expect(screen.getByText('Ask probability')).toBeInTheDocument();
    // First row
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getByText('2.2')).toBeInTheDocument();
    expect(screen.getByText('4.4')).toBeInTheDocument();
    // Second row
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('2.3')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    // Third row
    expect(screen.getByText('1.3')).toBeInTheDocument();
    expect(screen.getByText('2.4')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('renders uneven row counts correctly', () => {
    const k: kvb = [
      {
        key: 'askOffset',
        value: { vectorVal: { value: ['1.1'] } },
      },
      {
        key: 'askProbability',
        value: { vectorVal: { value: ['2.2'] } },
      },
      {
        key: 'bidOffset',
        value: { vectorVal: { value: ['1.1', '1.2', '1.3'] } },
      },
      {
        key: 'bidProbability',
        value: { vectorVal: { value: ['4.4', '4.5', '4.6'] } },
      },
    ];

    const screen = render(<StateVariableProposalRiskFactors kvb={k} />);
    expect(screen.getByText('Mid offset')).toBeInTheDocument();
    expect(screen.getByText('Bid probability')).toBeInTheDocument();
    expect(screen.getByText('Ask probability')).toBeInTheDocument();
    // First row, as previous test
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getByText('2.2')).toBeInTheDocument();
    expect(screen.getByText('4.4')).toBeInTheDocument();
    // Second row - offset comes from bid, not ask
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    // Third row
    expect(screen.getByText('1.3')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();

    // The askOffset levels without a probability render -
    expect(screen.getAllByText('-')).toHaveLength(2);
  });
});
