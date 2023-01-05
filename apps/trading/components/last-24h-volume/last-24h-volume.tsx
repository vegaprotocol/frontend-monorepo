import { calcCandleVolume } from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  t,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import { HeaderStat } from '../header';

interface Props {
  candles: { volume: string }[];
  positionDecimalPlaces?: number;
  isHeader?: boolean;
}

export const Last24hVolume = ({
  candles,
  positionDecimalPlaces,
  isHeader = false,
}: Props) => {
  const candleVolume = useMemo(() => {
    return calcCandleVolume(candles);
  }, [candles]);

  const formatDecimals = isHeader ? positionDecimalPlaces || 0 : 2;
  const content = useMemo(() => {
    return (
      <>
        {candleVolume && isNumeric(positionDecimalPlaces)
          ? addDecimalsFormatNumber(
              candleVolume,
              positionDecimalPlaces,
              formatDecimals
            )
          : '-'}
      </>
    );
  }, [candleVolume, positionDecimalPlaces, formatDecimals]);

  return isHeader ? (
    <HeaderStat
      heading={t('Volume (24h)')}
      testId="market-volume"
      description={
        candleVolume && positionDecimalPlaces
          ? t('The total amount of assets traded in the last 24 hours.')
          : null
      }
    >
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
