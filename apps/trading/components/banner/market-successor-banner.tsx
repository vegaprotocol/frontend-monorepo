import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { isBefore, formatDuration, intervalToDuration } from 'date-fns';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  calcCandleVolume,
  marketProvider,
  useCandles,
} from '@vegaprotocol/markets';
import {
  ExternalLink,
  Intent,
  NotificationBanner,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';

const getExpiryDate = (tags: string[], close?: string): Date | null => {
  const expiryDate = getMarketExpiryDate(tags);
  return expiryDate || (close && new Date(close)) || null;
};

export const MarketSuccessorBanner = () => {
  const { marketId } = useParams();
  const { pathname } = useLocation();
  const isMarketPage = pathname.match(/^\/markets\/(?!(all)).+/);

  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables: { marketId: marketId || '' },
    skip: !isMarketPage || !marketId,
  });

  const { data: successorData } = useDataProvider({
    dataProvider: marketProvider,
    variables: {
      marketId: data?.successorMarketID || '',
    },
    skip: !data?.successorMarketID,
  });

  const [visible, setVisible] = useState(true);

  const expiry = data
    ? getExpiryDate(
        data.tradableInstrument.instrument.metadata.tags || [],
        data.marketTimestamps.close
      )
    : null;

  const duration =
    expiry && isBefore(expiry, new Date())
      ? intervalToDuration({ start: new Date(), end: expiry })
      : null;

  const isInContinuesMode =
    successorData?.state === Types.MarketState.STATE_ACTIVE &&
    successorData?.tradingMode ===
      Types.MarketTradingMode.TRADING_MODE_CONTINUOUS;

  const { oneDayCandles } = useCandles({
    marketId: successorData?.id,
  });

  const candleVolume = oneDayCandles ? calcCandleVolume(oneDayCandles) : null;

  const successorVolume =
    candleVolume && isNumeric(successorData?.positionDecimalPlaces)
      ? addDecimalsFormatNumber(
          candleVolume,
          successorData?.positionDecimalPlaces as number
        )
      : null;

  if (isInContinuesMode && visible) {
    return (
      <NotificationBanner
        intent={Intent.Primary}
        onClose={() => {
          setVisible(false);
        }}
      >
        <div className="uppercase mb-1">
          {t('This market has been succeeded')}
        </div>
        <div>
          {duration &&
            t('This market expires in %s.', [
              formatDuration(duration, {
                format: [
                  'years',
                  'months',
                  'weeks',
                  'days',
                  'hours',
                  'minutes',
                ],
              }),
            ])}{' '}
          {t('The successor market')}{' '}
          <ExternalLink href={`/markets/${successorData?.id}`}>
            {successorData?.tradableInstrument.instrument.name}
          </ExternalLink>
          {successorVolume && ' ' + t('has %s 24h vol.', [successorVolume])}
        </div>
      </NotificationBanner>
    );
  }
  return null;
};
