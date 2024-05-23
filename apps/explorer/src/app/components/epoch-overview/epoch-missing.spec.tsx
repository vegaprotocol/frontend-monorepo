import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import EpochMissingOverview, { calculateEpochData } from './epoch-missing';
import { getSecondsFromInterval } from '@vegaprotocol/utils';
import { ExplorerFutureEpochDocument } from './__generated__/Epoch';
const START_DATE_PAST = 'Monday, 17 February 2022 11:44:09';
describe('getSecondsFromInterval', () => {
  it('returns 0 for bad data', () => {
    expect(getSecondsFromInterval(null as unknown as string)).toEqual(0);
    expect(getSecondsFromInterval('')).toEqual(0);
    expect(getSecondsFromInterval('🧙')).toEqual(0);
    expect(getSecondsFromInterval(2 as unknown as string)).toEqual(0);
  });

  it('parses out months from a capital M', () => {
    expect(getSecondsFromInterval('2M')).toEqual(5184000);
  });

  it('parses out days from a capital D', () => {
    expect(getSecondsFromInterval('1D')).toEqual(86400);
  });

  it('parses out hours from a lower case h', () => {
    expect(getSecondsFromInterval('11h')).toEqual(39600);
  });

  it('parses out minutes from a lower case m', () => {
    expect(getSecondsFromInterval('10m')).toEqual(600);
  });

  it('parses out seconds from a lower case s', () => {
    expect(getSecondsFromInterval('99s')).toEqual(99);
  });

  it('parses complex examples', () => {
    expect(getSecondsFromInterval('24h')).toEqual(86400);
    expect(getSecondsFromInterval('1h30m')).toEqual(5400);
    expect(getSecondsFromInterval('1D1h30m1s')).toEqual(91801);
  });
});

describe('calculateEpochData', () => {
  it('Handles bad data', () => {
    const currentEpochId = null as unknown as string;
    const missingEpochId = null as unknown as string;
    const epochStart = null as unknown as string;
    const epochLength = null as unknown as string;
    const res = calculateEpochData(
      currentEpochId,
      missingEpochId,
      epochStart,
      epochLength
    );

    expect(res).toHaveProperty('label', 'Missing data');
    expect(res).toHaveProperty('isInFuture', false);
  });

  it('Calculates that a bigger epoch number is in the future from basic data', () => {
    const currentEpochId = '10';
    const missingEpochId = '20';
    const epochStart = '';
    const epochLength = '';
    const res = calculateEpochData(
      currentEpochId,
      missingEpochId,
      epochStart,
      epochLength
    );

    expect(res).toHaveProperty('isInFuture', true);
  });

  it('If it has an epoch length and a start time, it provides an estimate', () => {
    const currentEpochId = '10';
    const missingEpochId = '20';
    const epochStart = START_DATE_PAST;
    const epochLength = '1s';
    const res = calculateEpochData(
      currentEpochId,
      missingEpochId,
      epochStart,
      epochLength
    );

    // 'Estimate: 17/02/2022, 11:44:19 - in less than a minute')
    expect(res).toHaveProperty('label');
    expect(res.label).toMatch(/^Estimate/);
    expect(res.label).toMatch(/in less than a minute$/);
  });

  it('Provide decent string for past', () => {
    const currentEpochId = '20';
    const missingEpochId = '10';
    const epochStart = START_DATE_PAST;
    const epochLength = '1s';
    const res = calculateEpochData(
      currentEpochId,
      missingEpochId,
      epochStart,
      epochLength
    );

    // 'Estimate: 17/02/2022, 11:44:19 - in less than a minute')
    expect(res).toHaveProperty('label');
    expect(res.label).toMatch(/^Estimate/);
    expect(res.label).toMatch(/less than a minute ago$/);
  });
});

describe('EpochMissingOverview', () => {
  function renderComponent(missingEpochId: string) {
    const mock: MockedResponse = {
      request: {
        query: ExplorerFutureEpochDocument,
      },
      result: {
        data: {
          epoch: {
            id: '10',
            timestamps: {
              start: START_DATE_PAST,
            },
          },
          networkParameter: {
            value: '1s',
          },
        },
      },
    };

    return render(
      <MockedProvider mocks={[mock]}>
        <EpochMissingOverview missingEpochId={missingEpochId} />
      </MockedProvider>
    );
  }

  it('renders a - if no id is provided', () => {
    const n = null as unknown as string;
    const screen = renderComponent(n);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
});
