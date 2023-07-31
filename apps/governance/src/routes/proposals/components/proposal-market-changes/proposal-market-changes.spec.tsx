import { render, fireEvent } from '@testing-library/react';
import {
  ProposalMarketChanges,
  applyImmutableKeysFromEarlierVersion,
} from './proposal-market-changes';
import type { JsonValue } from '../../../../components/json-diff';

describe('applyImmutableKeysFromEarlierVersion', () => {
  it('returns an empty object if any argument is not an object or null', () => {
    const earlierVersion: JsonValue = null;
    const updatedVersion: JsonValue = null;
    expect(
      applyImmutableKeysFromEarlierVersion(earlierVersion, updatedVersion)
    ).toEqual({});
  });

  it('overrides updatedVersion with values from earlierVersion for immutable keys', () => {
    const earlierVersion: JsonValue = {
      decimalPlaces: 2,
      positionDecimalPlaces: 3,
      instrument: {
        name: 'Instrument1',
        future: {
          settlementAsset: 'Asset1',
        },
      },
    };

    const updatedVersion: JsonValue = {
      decimalPlaces: 3, // should be overridden by 2
      positionDecimalPlaces: 4, // should be overridden by 3
      instrument: {
        name: 'Instrument2', // should be overridden by 'Instrument1'
        future: {
          settlementAsset: 'Asset2', // should be overridden by 'Asset1'
        },
      },
    };

    const expected: JsonValue = {
      decimalPlaces: 2,
      positionDecimalPlaces: 3,
      instrument: {
        name: 'Instrument1',
        future: {
          settlementAsset: 'Asset1',
        },
      },
    };

    expect(
      applyImmutableKeysFromEarlierVersion(earlierVersion, updatedVersion)
    ).toEqual(expected);
  });
});

describe('ProposalMarketChanges', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <ProposalMarketChanges
        originalProposal={{}}
        latestEnactedProposal={{}}
        updatedProposal={{}}
      />
    );
    expect(getByTestId('proposal-market-changes')).toBeInTheDocument();
  });

  it('JsonDiff is not visible when showChanges is false', () => {
    const { queryByTestId } = render(
      <ProposalMarketChanges
        originalProposal={{}}
        latestEnactedProposal={{}}
        updatedProposal={{}}
      />
    );
    expect(queryByTestId('json-diff')).not.toBeInTheDocument();
  });

  it('JsonDiff is visible when showChanges is true', async () => {
    const { getByTestId } = render(
      <ProposalMarketChanges
        originalProposal={{}}
        latestEnactedProposal={{}}
        updatedProposal={{}}
      />
    );
    fireEvent.click(getByTestId('proposal-market-changes-toggle'));
    expect(getByTestId('json-diff')).toBeInTheDocument();
  });
});
