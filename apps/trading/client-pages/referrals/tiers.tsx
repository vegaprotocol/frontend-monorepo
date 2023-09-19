import { getDateTimeFormat } from '@vegaprotocol/utils';
import { useReferralProgram } from './hooks/use-referral-program';
import { Table } from './table';
import classNames from 'classnames';
import { BORDER_COLOR, GRADIENT } from './constants';
import { Tag } from './tag';
import type { ComponentProps } from 'react';

const Loading = ({ variant }: { variant: 'large' | 'inline' }) => (
  <div
    className={classNames(
      'bg-vega-clight-800 dark:bg-vega-cdark-800 rounded-lg animate-pulse',
      {
        'w-full h-20': variant === 'large',
      }
    )}
  ></div>
);

const StakingTier = ({
  tier,
  label,
  referralRewardMultiplier,
  minimumStakedTokens,
}: {
  tier: number;
  label: string;
  referralRewardMultiplier: string;
  minimumStakedTokens: string;
}) => {
  const color: Record<number, ComponentProps<typeof Tag>['color']> = {
    1: 'green',
    2: 'blue',
    3: 'pink',
  };
  return (
    <div
      className={classNames(
        'overflow-hidden',
        'border rounded-md w-full',
        BORDER_COLOR
      )}
    >
      <div aria-hidden>
        {tier < 4 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/${tier}x.png`}
            alt={`${referralRewardMultiplier}x multiplier`}
            width={768}
            height={400}
            className="w-full"
          />
        )}
      </div>
      <div className={classNames('p-3', GRADIENT)}>
        <h3 className="mb-3 text-xl">{label}</h3>
        <p className="text-base text-vega-clight-100 dark:text-vega-cdark-100">
          Stake a minimum of {minimumStakedTokens} $VEGA tokens
        </p>
        <Tag color={color[tier]}>
          Reward multiplier {referralRewardMultiplier}x
        </Tag>
      </div>
    </div>
  );
};

export const TiersContainer = () => {
  const { benefitTiers, stakingTiers, details, loading } = useReferralProgram();

  const ends = details?.endOfProgramTimestamp
    ? getDateTimeFormat().format(new Date(details.endOfProgramTimestamp))
    : undefined;

  return (
    <>
      <div className="flex flex-row items-baseline justify-between mt-10 mb-5">
        <h2 className="text-2xl">Referral tiers</h2>
        {ends && (
          <span className="text-base">
            <span className="text-vega-clight-200 dark:text-vega-cdark-200">
              Program ends:
            </span>{' '}
            {ends}
          </span>
        )}
      </div>
      <div className="mb-20">
        {loading || !benefitTiers || benefitTiers.length === 0 ? (
          <Loading variant="large" />
        ) : (
          <TiersTable data={benefitTiers} />
        )}
      </div>

      <div className="flex flex-row items-baseline justify-between mb-5">
        <h2 className="text-2xl">Staking multipliers</h2>
      </div>
      <div className="flex flex-col mb-20 justify-items-stretch md:flex-row gap-5">
        {loading || !stakingTiers || stakingTiers.length === 0 ? (
          <>
            <Loading variant="large" />
            <Loading variant="large" />
            <Loading variant="large" />
          </>
        ) : (
          <StakingTiers data={stakingTiers} />
        )}
      </div>
    </>
  );
};

const StakingTiers = ({
  data,
}: {
  data: ReturnType<typeof useReferralProgram>['stakingTiers'];
}) => (
  <>
    {data.map(
      ({ tier, label, referralRewardMultiplier, minimumStakedTokens }, i) => (
        <StakingTier
          key={i}
          tier={tier}
          label={label}
          referralRewardMultiplier={referralRewardMultiplier}
          minimumStakedTokens={minimumStakedTokens}
        />
      )
    )}
  </>
);

const TiersTable = ({
  data,
}: {
  data: Array<{
    tier: number;
    commission: string;
    discount: string;
    volume: string;
  }>;
}) => {
  return (
    <Table
      columns={[
        { name: 'tier', displayName: 'Tier' },
        {
          name: 'commission',
          displayName: 'Referrer commission',
          tooltip: 'A percentage of commission earned by the referrer',
        },
        { name: 'discount', displayName: 'Referrer trading discount' },
        { name: 'volume', displayName: 'Min. trading volume' },
      ]}
      data={data.map((d) => ({
        ...d,
        className: classNames({
          'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight':
            d.tier === 1,
          'from-vega-purple-400 dark:from-vega-purple-600 to-20%  bg-highlight':
            d.tier === 2,
          'from-vega-blue-400 dark:from-vega-blue-600 to-20%  bg-highlight':
            d.tier === 3,
          'from-vega-orange-400 dark:from-vega-orange-600 to-20%  bg-highlight':
            d.tier > 3,
        }),
      }))}
    />
  );
};
