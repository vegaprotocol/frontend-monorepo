import { act, render, screen, waitFor } from '@testing-library/react';
import PositionsTable from './positions-table';
import type { Positions_party_positions } from './__generated__/Positions';
import { MarketTradingMode } from '@vegaprotocol/types';

const singleRow: Positions_party_positions = {
  realisedPNL: '520000000',
  openVolume: '10000',
  unrealisedPNL: '895000',
  averageEntryPrice: '1129935',
  market: {
    id: 'b7010da9dbe7fbab2b74d9d5642fc4a8a0ca93ef803d21fa60c2cacd0416bba0',
    name: 'UNIDAI Monthly (30 Jun 2022)',
    data: {
      markPrice: '1138885',
      marketTradingMode: MarketTradingMode.Continuous,
      __typename: 'MarketData',
      market: { __typename: 'Market', id: '123' },
    },
    positionDecimalPlaces: 2,
    decimalPlaces: 5,
    tradableInstrument: {
      instrument: {
        id: '',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        metadata: {
          tags: [
            'formerly:3C58ED2A4A6C5D7E',
            'base:UNI',
            'quote:DAI',
            'class:fx/crypto',
            'monthly',
            'sector:defi',
          ],
          __typename: 'InstrumentMetadata',
        },
        code: 'UNIDAI.MF21',
        product: {
          settlementAsset: {
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            symbol: 'tDAI',
            name: 'tDAI TEST',
            decimals: 5,
            __typename: 'Asset',
          },
          quoteName: 'DAI',
          __typename: 'Future',
        },
        __typename: 'Instrument',
      },
      __typename: 'TradableInstrument',
    },
    __typename: 'Market',
  },
  __typename: 'Position',
};
const singleRowData = [singleRow];

describe('PositionsTable', () => {
  it('should render successfully', async () => {
    act(async () => {
      const { baseElement } = render(<PositionsTable data={[]} />);
      expect(baseElement).toBeTruthy();
    });
  });

  it('should render correct columns', async () => {
    act(async () => {
      render(<PositionsTable data={singleRowData} />);
      await waitFor(async () => {
        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(5);
        expect(headers.map((h) => h.textContent?.trim())).toEqual([
          'Market',
          'Amount',
          'Average Entry Price',
          'Mark Price',
          'Realised PNL',
        ]);
      });
    });
  });

  it('should apply correct formatting', () => {
    act(async () => {
      render(<PositionsTable data={singleRowData} />);
      await waitFor(async () => {
        const cells = screen.getAllByRole('gridcell');
        const expectedValues = [
          singleRow.market.tradableInstrument.instrument.code,
          '+100.00',
          '11.29935',
          '11.38885',
          '+5,200.000',
        ];
        cells.forEach((cell, i) => {
          expect(cell).toHaveTextContent(expectedValues[i]);
        });
        expect(cells[cells.length - 1]).toHaveClass('color-vega-green');
      });
    });
  });
});
