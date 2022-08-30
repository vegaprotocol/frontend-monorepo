import { t, dateValueFormatter } from '@vegaprotocol/react-helpers';
import { useLiquidityProvision } from './liquidity-data-provider';
import type { MarketLiquidity } from './__generated__/MarketLiquidity';

export const MyLiquidityProvisionContainer = ({
  partyId,
  data,
}: {
  partyId: string;
  data?: MarketLiquidity;
}) => {
  const { liquidityProviders } = useLiquidityProvision({
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
          <div>{commitmentAmount || '-'}</div>
        </div>
        <div>
          <div>{t('Share')}</div>
          <div className="break-words">{equityLikeShare || '-'}</div>
        </div>
        <div>
          <div>{t('Fee')}</div>
          <div>{fee || '-'}</div>
        </div>
        <div>
          <div>{t('Average entry valuation')}</div>
          <div>{averageEntryValuation || '-'}</div>
        </div>
        <div>
          <div>{t('Obligation (siskas)')}</div>
          <div>{obligation || '-'}</div>
        </div>
        <div>
          <div>{t('Supplied (siskas)')}</div>
          <div>{supplied || '-'}</div>
        </div>
        <div>
          <div>{t('Status')}</div>
          <div>{status}</div>
        </div>
        <div>
          <div>{t('Created')}</div>
          <div>{dateValueFormatter({ value: createdAt })}</div>
        </div>
        <div>
          <div>{t('Updated')}</div>
          <div>{dateValueFormatter({ value: updatedAt })}</div>
        </div>
      </div>
    </div>
  );
};
