import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { isBefore, formatDuration, intervalToDuration } from 'date-fns';
import {
  calcCandleVolume,
  useCandles,
  useSuccessorMarket,
  type Market,
} from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  getMarketExpiryDate,
  isNumeric,
} from '@vegaprotocol/utils';
import { useT, ns } from '../../lib/use-t';
import { Links } from '../../lib/links';

const getExpiryDate = (tags: string[], close?: string): Date | null => {
  const expiryDate = getMarketExpiryDate(tags);
  return expiryDate || (close && new Date(close)) || null;
};

export const MarketSettledBanner = ({ market }: { market: Market }) => {
  const t = useT();
  const { data: successorMarket } = useSuccessorMarket(market.id);

  const expiry = market
    ? getExpiryDate(
        market.tradableInstrument.instrument.metadata.tags || [],
        market.marketTimestamps.close
      )
    : null;

  const duration =
    expiry && isBefore(new Date(Date.now()), expiry)
      ? intervalToDuration({ start: new Date(Date.now()), end: expiry })
      : null;

  const { oneDayCandles } = useCandles({
    marketId: successorMarket?.id,
  });

  const candleVolume = oneDayCandles?.length
    ? calcCandleVolume(oneDayCandles)
    : null;

  const successorVolume =
    candleVolume && isNumeric(successorMarket?.positionDecimalPlaces)
      ? addDecimalsFormatNumber(
          candleVolume,
          successorMarket?.positionDecimalPlaces as number
        )
      : null;

  if (successorMarket) {
    return (
      <div>
        <p>{t('This market has been succeeded')}</p>
        {duration && (
          <div className="mt-1">
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
            <>
              {' '}
              {successorVolume ? (
                <Trans
                  defaults="The successor market <0>{{instrumentName}}</0> has a 24h trading volume of {{successorVolume}}"
                  values={{
                    successorVolume,
                    instrumentName:
                      successorMarket?.tradableInstrument.instrument.name,
                  }}
                  components={[
                    <Link
                      to={Links.MARKET(successorMarket.id)}
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
                      successorMarket?.tradableInstrument.instrument.name,
                  }}
                  components={[
                    <Link
                      to={Links.MARKET(successorMarket.id)}
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
          </div>
        )}
      </div>
    );
  }

  return <p>{t('This market has been settled')}</p>;
};
