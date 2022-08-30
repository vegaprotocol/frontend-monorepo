import {
  t,
  formatNumberPercentage,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from 'bignumber.js';
import { useLiquidityProvision } from './liquidity-data-provider';
import type { MarketLiquidity } from './__generated__/MarketLiquidity';

export const MyLiquidityProvisionContainer = ({
  partyId,
  data,
}: {
  partyId: string;
  data?: MarketLiquidity;
}) => {
  const { liquidityProviders, decimalPlaces, positionDecimalPlaces } =
    useLiquidityProvision({
      data,
      partyId,
    });

  if (!liquidityProviders || liquidityProviders.length === 0) {
    return null;
  }

  const {
    party,
    commitmentAmount,
    equityLikeShare,
    fee,
    averageEntryValuation,
    obligation,
    supplied,
    status,
    createdAt,
    updatedAt,
  } = liquidityProviders[0];

  return (
    <div>
      <div className="text-ui font-bold text-black dark:text-white my-10">
        {t('My liquidity provision')}
      </div>
      <div className="grid grid-cols-8 gap-24 break-words">
        <div>
          <div>{t('Party')}</div>
          <div>{party || '-'}</div>
        </div>
        <div>
          <div>{t('Commitment')}</div>
          <div>
            {(commitmentAmount &&
              addDecimalsFormatNumber(
                commitmentAmount,
                positionDecimalPlaces
              )) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Share')}</div>
          <div className="break-words">
            {(equityLikeShare &&
              formatNumberPercentage(
                new BigNumber(equityLikeShare).times(100)
              )) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Fee')}</div>
          <div>
            {(fee && formatNumberPercentage(new BigNumber(fee).times(100))) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Average entry valuation')}</div>
          <div>
            {(averageEntryValuation &&
              addDecimalsFormatNumber(averageEntryValuation, decimalPlaces)) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Obligation (siskas)')}</div>
          <div>
            {(obligation &&
              addDecimalsFormatNumber(obligation, positionDecimalPlaces)) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Supplied (siskas)')}</div>
          <div>
            {(supplied &&
              addDecimalsFormatNumber(supplied, positionDecimalPlaces)) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Status')}</div>
          <div>{status && t(LiquidityProvisionStatusMapping[status])}</div>
        </div>
        <div>
          <div>{t('Created')}</div>
          <div>
            {(createdAt && getDateTimeFormat().format(new Date(createdAt))) ||
              '-'}
          </div>
        </div>
        <div>
          <div>{t('Updated')}</div>
          <div>
            {(updatedAt && getDateTimeFormat().format(new Date(updatedAt))) ||
              '-'}
          </div>
        </div>
      </div>
    </div>
  );
};
