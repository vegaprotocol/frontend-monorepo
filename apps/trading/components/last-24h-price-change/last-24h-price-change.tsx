import { useMemo } from 'react';
import { isNumeric, t } from '@vegaprotocol/react-helpers';
import { PriceCellChange } from '@vegaprotocol/ui-toolkit';
import type { CandleClose } from '@vegaprotocol/types';
import { HeaderStat } from '../header';

interface Props {
  candles: { close: string }[];
  decimalPlaces?: number;
  isHeader?: boolean;
}

export const Last24hPriceChange = ({
  candles,
  decimalPlaces,
  isHeader = false,
}: Props) => {
  const candlesClose = useMemo(() => {
    return candles
      .map((candle) => candle?.close)
      .filter((c): c is CandleClose => c !== null);
  }, [candles]);

  const content = useMemo(() => {
    if (!isNumeric(decimalPlaces)) {
      return <>-</>;
    }
    return (
      <PriceCellChange candles={candlesClose} decimalPlaces={decimalPlaces} />
    );
  }, [candlesClose, decimalPlaces]);

  return isHeader ? (
    <HeaderStat heading={t('Change (24h)')} testId="market-change">
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
