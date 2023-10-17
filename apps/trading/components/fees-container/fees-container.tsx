import { useMemo } from 'react';
import type { ReactNode } from 'react';
import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import type { FeesQuery } from './__generated__/Fees';
import { useFeesQuery } from './__generated__/Fees';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { useMarketList } from '@vegaprotocol/markets';
import { AgGrid } from '@vegaprotocol/datagrid';
import { ProductTypeMapping } from '@vegaprotocol/types';

/**
 * TODO:
 * - Liquidity fees for market
 * - 'Your tier' pills
 * - Styles for ag grid dont work inside these cards
 * - Better loading states
 * - Remove hardcoded partyId
 */

const VOLUME_EPOCHS = 7;

export const FeesContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);
  const { data, loading, error } = useFeesQuery({
    variables: {
      partyId:
        // TODO: change for pubkey
        '9e2445e0e98c0e0ca1c260baaab1e7a2f1b9c7256c27196be6e614ee44d1a1e7',
      volumeDiscountStatsEpochs: VOLUME_EPOCHS,
    },
    skip: !pubKey,
  });
  const { data: markets } = useMarketList();

  if (!pubKey) {
    return <p>Please connect wallet</p>;
  }

  if (error) {
    return <p>Failed to fetch fee data</p>;
  }

  // TODO: skeleton loading states
  if (loading || !data) {
    return <p>Loading...</p>;
  }

  const referralStats = compact(data.referralSetStats.edges).map((e) => e.node);
  const referralDiscount = referralStats[0].discountFactor;
  const volumeStats = compact(data.volumeDiscountStats.edges).map(
    (e) => e.node
  );
  const volumeDiscount = volumeStats[0].discountFactor;
  const totalDiscount = Number(referralDiscount) + Number(volumeDiscount);

  return (
    <div className="p-3">
      <h1 className="px-4 pt-2 pb-4 text-2xl">{t('Fees')}</h1>
      <div className="grid lg:auto-rows-min lg:grid-cols-4 gap-3">
        <FeeCard title={t('Trading fees')}>
          <TradingFees params={params} markets={markets} />
        </FeeCard>
        <FeeCard title={t('Current volume')}>
          <CurrentVolume data={data.volumeDiscountStats} />
        </FeeCard>
        <FeeCard title={t('Referral benefits')}>
          <ReferralBenefits
            currentEpoch={data.epoch}
            data={data.referralSetReferees}
          />
        </FeeCard>
        <FeeCard title={t('Total discount')}>
          <TotalDiscount totalDiscount={totalDiscount} />
        </FeeCard>
        <FeeCard title={t('Volume discount')} className="lg:col-span-2">
          <VolumeTiers program={data.currentVolumeDiscountProgram} />
        </FeeCard>
        <FeeCard title={t('Referral discount')} className="lg:col-span-2">
          <ReferralTiers program={data.currentReferralProgram} />
        </FeeCard>
        <FeeCard title={t('Liquidity fees')} className="lg:col-span-full">
          <LiquidityFees markets={markets} totalDiscount={totalDiscount} />
        </FeeCard>
      </div>
    </div>
  );
};

const FeeCard = ({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'p-4 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        className
      )}
    >
      <h2 className="mb-3">{title}</h2>
      {children}
    </div>
  );
};

const TradingFees = ({
  params,
  markets,
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: MarketMaybeWithDataAndCandles[] | null;
}) => {
  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total =
    Number(params.market_fee_factors_makerFee) +
    Number(params.market_fee_factors_infrastructureFee);

  let minTotal = total;
  let maxTotal = total;

  if (minLiq && maxLiq) {
    minTotal = total + Number(minLiq.fees.factors.liquidityFee);
    maxTotal = total + Number(maxLiq.fees.factors.liquidityFee);
  }

  return (
    <div>
      <div className="pt-6 leading-none">
        <p className="block text-3xl leading-none">
          {minLiq && maxLiq
            ? `${format(minTotal)}%-${format(maxTotal)}%`
            : `${format(total)}%`}
        </p>
        <table className="w-full text-xs text-muted">
          <tbody>
            <tr>
              <th className="font-normal text-left">{t('Infrastructure')}</th>
              <td className="text-right">
                {format(Number(params.market_fee_factors_infrastructureFee))}%
              </td>
            </tr>
            <tr>
              <th className="font-normal text-left ">{t('Maker')}</th>
              <td className="text-right">
                {format(Number(params.market_fee_factors_makerFee))}%
              </td>
            </tr>
            {minLiq && maxLiq && (
              <tr>
                <th className="font-normal text-left ">{t('Liquidity')}</th>
                <td className="text-right">
                  {format(Number(minLiq.fees.factors.liquidityFee))}%{'-'}
                  {format(Number(maxLiq.fees.factors.liquidityFee))}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CurrentVolume = ({
  data,
}: {
  data: FeesQuery['volumeDiscountStats'];
}) => {
  const total = compact(data.edges)
    .map((e) => e.node)
    .reduce((sum, d) => {
      return sum + BigInt(d.runningVolume);
    }, BigInt(0));

  return (
    <div>
      <Stat
        value={total.toString()}
        text={t('over the last %s epochs', VOLUME_EPOCHS.toString())}
      />
    </div>
  );
};

const ReferralBenefits = ({
  currentEpoch,
  data,
}: {
  currentEpoch: FeesQuery['epoch'];
  data: FeesQuery['referralSetReferees'];
}) => {
  const referralSets = compact(data.edges).map((e) => e.node);
  // you can only be in one referral set at a time
  const referralSet = referralSets[0];
  const epochsInSet = Number(currentEpoch.id) - referralSet.atEpoch;

  return (
    <div>
      <Stat
        value={referralSet.totalRefereeNotionalTakerVolume}
        text={'combined running notional over the last 7 epochs'}
      />
      <Stat value={epochsInSet} text={t('epochs in referral set')} />
    </div>
  );
};

const TotalDiscount = ({ totalDiscount }: { totalDiscount: number }) => {
  return (
    <div>
      <Stat
        value={format(totalDiscount) + '%'}
        text={t('combined volume & referral discounts')}
      />
    </div>
  );
};

const VolumeTiers = ({
  program,
}: {
  program?: FeesQuery['currentVolumeDiscountProgram'];
}) => {
  if (!program || !program.benefitTiers.length) {
    return <p>{t('No referral program active')}</p>;
  }

  const tiers = Array.from(program.benefitTiers).reverse();

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Min. trading volume')}</Th>
          </tr>
        </THead>
        <tbody>
          {tiers.map((t, i) => {
            return (
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{t.volumeDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const ReferralTiers = ({
  program,
}: {
  program?: FeesQuery['currentReferralProgram'];
}) => {
  if (!program || !program.benefitTiers.length) {
    return <p>{t('No referral program active')}</p>;
  }

  const tiers = Array.from(program.benefitTiers).reverse();

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Min. trading volume')}</Th>
            <Th>{t('Required epochs')}</Th>
          </tr>
        </THead>
        <tbody>
          {tiers.map((t, i) => {
            return (
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{t.referralDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
                <Td>{t.minimumEpochs}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const LiquidityFees = ({
  markets,
  totalDiscount,
}: {
  markets: MarketMaybeWithDataAndCandles[] | null;
  totalDiscount: number;
}) => {
  const rows = useMemo(() => {
    if (!markets?.length) return [];

    return compact(markets).map((m) => {
      const infraFee = Number(m.fees.factors.infrastructureFee);
      const makerFee = Number(m.fees.factors.makerFee);
      const liquidityFee = Number(m.fees.factors.liquidityFee);
      const feeBeforeDiscount = infraFee + makerFee + liquidityFee;
      // I don't think its possible to calculate this value without
      // knowing to what value its being applied
      const feeAfterDiscount = 'TODO: can we calc this?';

      return {
        code: m.tradableInstrument.instrument.code,
        product: m.tradableInstrument.instrument.product.__typename
          ? ProductTypeMapping[
              m.tradableInstrument.instrument.product.__typename
            ]
          : '-',
        infraFee,
        makerFee,
        liquidityFee,
        feeBeforeDiscount: format(feeBeforeDiscount),
        feeAfterDiscount: feeAfterDiscount,
      };
    });
  }, [markets]);

  const columnDefs = useMemo(() => {
    return [
      { field: 'code' },
      { field: 'product' },
      { field: 'infraFee' },
      { field: 'makerFee' },
      { field: 'liquidityFee' },
      { field: 'feeBeforeDiscount' },
      { field: 'feeAfterDiscount' },
    ];
  }, []);

  return (
    <div className="border border-default">
      <AgGrid
        columnDefs={columnDefs}
        rowData={rows}
        domLayout="autoHeight"
        onFirstDataRendered={({ columnApi }) => {
          columnApi?.autoSizeAllColumns();
        }}
      />
    </div>
  );
};

const cellClass = 'px-4 py-2 text-sm font-normal text-left';

const Th = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

const Td = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </table>
  );
};

const THead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="border-b bg-vega-clight-700 dark:bg-vega-cdark-700 border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </thead>
  );
};

const Stat = ({ value, text }: { value: string | number; text: string }) => {
  return (
    <p className="pt-3 leading-none first:pt-6">
      <span className="block text-3xl leading-none">{value}</span>
      <small className="block text-xs text-muted">{text}</small>
    </p>
  );
};

const format = (num: number) => parseFloat((num * 100).toFixed(5));
