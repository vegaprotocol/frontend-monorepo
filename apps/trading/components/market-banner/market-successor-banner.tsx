import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { isBefore, formatDuration, intervalToDuration } from 'date-fns';
import {
  calcCandleVolume,
  useCandles,
  useMarketState,
  useSuccessorMarket,
  type Market,
} from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
  isNumeric,
} from '@vegaprotocol/utils';
import * as Types from '@vegaprotocol/types';
import { useT, ns } from '../../lib/use-t';
import { Links } from '../../lib/links';

const getExpiryDate = (tags: string[], close?: string): Date | null => {
  const expiryDate = getMarketExpiryDate(tags);
  return expiryDate || (close && new Date(close)) || null;
};

export const MarketSuccessorBanner = ({
  market,
}: {
  market: Market | null;
}) => {
  const t = useT();
  const { data: marketState } = useMarketState(market?.id);
  const isSettled = marketState === Types.MarketState.STATE_SETTLED;
  const { data: successorData, loading } = useSuccessorMarket(market?.id);

  const expiry = market
    ? getExpiryDate(
        market.tradableInstrument.instrument.metadata.tags || [],
        market.marketTimestamps.close
      )
    : null;

  const duration =
    expiry && isBefore(new Date(), expiry)
      ? intervalToDuration({ start: new Date(), end: expiry })
      : null;

  const { oneDayCandles } = useCandles({
    marketId: successorData?.id,
  });

  const candleVolume = oneDayCandles?.length
    ? calcCandleVolume(oneDayCandles)
    : null;

  const successorVolume =
    candleVolume && isNumeric(successorData?.positionDecimalPlaces)
      ? addDecimalsFormatNumber(
          candleVolume,
          successorData?.positionDecimalPlaces as number
        )
      : null;

  if (!loading && (isSettled || successorData)) {
    return (
      <div>
        <div className="uppercase">
          {successorData
            ? t('This market has been succeeded')
            : t('This market has been settled')}
        </div>
        {(duration || successorData) && (
          <div className="mt-1">
            {duration && (
              <span>
                {t('This market expires in {{duration}}.', {
                  duration: formatDuration(duration, {
                    format: [
                      'years',
                      'months',
                      'weeks',
                      'days',
                      'hours',
                      'minutes',
                    ],
                  }),
                })}
              </span>
            )}
            {successorData && (
              <>
                {' '}
                {successorVolume ? (
                  <Trans
                    defaults="The successor market <0>{{instrumentName}}</0> has a 24h trading volume of {{successorVolume}}"
                    values={{
                      successorVolume,
                      instrumentName:
                        successorData?.tradableInstrument.instrument.name,
                    }}
                    components={[
                      <Link
                        to={Links.MARKET(successorData.id)}
                        key="link"
                        target="_blank"
                      >
                        successor market name
                      </Link>,
                    ]}
                  />
                ) : (
                  <Trans
                    defaults="The successor market is <0>{{instrumentName}}</0>"
                    values={{
                      instrumentName:
                        successorData?.tradableInstrument.instrument.name,
                    }}
                    components={[
                      <Link
                        to={Links.MARKET(successorData.id)}
                        key="link"
                        target="_blank"
                      >
                        successor market name
                      </Link>,
                    ]}
                    ns={ns}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};
