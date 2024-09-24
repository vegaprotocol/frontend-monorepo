import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import {
  type ReferralStakingTier,
  useCurrentPrograms,
} from '../../lib/hooks/use-current-programs';
import { Table } from '../../components/table';
import { cn, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { BORDER_COLOR, GRADIENT } from './constants';
import { Tag } from '../../components/helpers/tag';
import { getTierColor, getTierGradient } from '../../components/helpers/tiers';
import { useState, type ReactNode } from 'react';
import { ExternalLink, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import {
  DApp,
  DocsLinks,
  TOKEN_PROPOSAL,
  TOKEN_PROPOSALS,
  useLinks,
} from '@vegaprotocol/environment';
import { useT, ns } from '../../lib/use-t';
import { Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';

const Loading = ({ variant }: { variant: 'large' | 'inline' }) => (
  <div
    className={cn('bg-surface-2 rounded-lg animate-pulse', {
      'w-full h-20': variant === 'large',
    })}
  ></div>
);

const StakingTier = ({
  tier,
  referralRewardMultiplier,
  minimumStakedTokens,
  max,
}: {
  tier: number;
  referralRewardMultiplier: string;
  minimumStakedTokens: string;
  max?: number;
}) => {
  const t = useT();
  const minimum = addDecimalsFormatNumber(minimumStakedTokens, 18);

  // TODO: Decide what to do with the multiplier images
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const multiplierImage = (
    <div
      aria-hidden
      className={cn(
        'w-full max-w-[80px] h-full min-h-[80px]',
        'bg-cover bg-right-bottom',
        {
          "bg-[url('/1x.png')]": tier === 1,
          "bg-[url('/2x.png')]": tier === 2,
          "bg-[url('/3x.png')]": tier === 3,
        }
      )}
    >
      <span className="sr-only">{`${referralRewardMultiplier}x multiplier`}</span>
    </div>
  );

  return (
    <div
      className={cn(
        'overflow-hidden',
        'border border-gs-300 dark:border-gs-700 rounded-md w-full',
        'flex flex-row',
        'bg-surface-0',
        GRADIENT,
        BORDER_COLOR
      )}
    >
      <div className={cn('p-3 flex flex-row min-h-[80px] h-full items-center')}>
        <div>
          <Tag color={getTierColor(tier, max)}>
            {t('Multiplier')} {referralRewardMultiplier}x
          </Tag>
          <p className="mt-1 text-sm text-surface-1-fg ">
            <Trans
              defaults="Stake a minimum of <0>{{minimum}}</0> $VEGA tokens"
              values={{ minimum }}
              components={[<b key={minimum}></b>]}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export const TiersContainer = () => {
  const t = useT();
  const { referralProgram, loading, error } = useCurrentPrograms();

  const details = referralProgram?.details;
  const benefitTiers = referralProgram?.benefitTiers;
  const stakingTiers = referralProgram?.stakingTiers;

  const ends = details?.endOfProgramTimestamp
    ? getDateTimeFormat().format(new Date(details.endOfProgramTimestamp))
    : undefined;

  const governanceLink = useLinks(DApp.Governance);

  if ((!loading && !details) || error) {
    return (
      <div className="bg-surface-1  text-black dark:text-white rounded-lg p-6 mt-1 mb-20 text-sm text-center">
        <Trans
          defaults="There are currently no active referral programs. Check the <0>Governance App</0> to see if there are any proposals in progress and vote."
          components={[
            <ExternalLink
              href={governanceLink(TOKEN_PROPOSALS)}
              key="link"
              className="underline"
            >
              {t('Governance App')}
            </ExternalLink>,
          ]}
          ns={ns}
        />{' '}
        <Trans
          defaults="Use the <0>docs</0> tutorial to propose a new program."
          components={[
            <ExternalLink
              href={DocsLinks?.REFERRALS}
              key="link"
              className="underline"
            >
              {t('docs')}
            </ExternalLink>,
          ]}
          ns={ns}
        />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-alt calt" id="current-program-details">
        {t('Current program details')}
      </h2>
      {details?.id && (
        <p className="mb-10">
          <Trans
            defaults="As a result of governance proposal <0>{{proposal}}</0> the program below is currently active on the Vega network."
            values={{ proposal: truncateMiddle(details.id) }}
            components={[
              <ExternalLink
                key="referral-program-proposal-link"
                href={governanceLink(TOKEN_PROPOSAL.replace(':id', details.id))}
                className="underline"
              >
                proposal
              </ExternalLink>,
            ]}
          />
        </p>
      )}

      {/* Meta */}
      <div className="mb-2 flex flex-row items-baseline justify-between text-xs text-surface-1-fg  font-alt calt">
        {details?.id && (
          <span>
            {t('Proposal ID:')}{' '}
            <ExternalLink
              href={governanceLink(TOKEN_PROPOSAL.replace(':id', details.id))}
            >
              <span>{truncateMiddle(details.id)}</span>
            </ExternalLink>
          </span>
        )}
        {ends && (
          <span>
            {t('Program ends:')} {ends}
          </span>
        )}
      </div>

      {/* Container */}
      <div
        className={cn(
          'md:bg-surface-1',
          'md:',
          'md:text-black',
          'md:dark:text-white',
          'md:rounded-lg',
          'md:p-6'
        )}
      >
        {/* Benefit tiers */}
        <div className="flex flex-col mb-5">
          <h3 className="text-2xl calt">{t('Benefit tiers')}</h3>
          <p className="text-sm text-surface-2-fg ">
            {t(
              'Members of a referral group can access the increasing commission and discount benefits defined in the program based on their combined running volume.'
            )}
          </p>
        </div>
        <div className="mb-10">
          {loading || !benefitTiers || benefitTiers.length === 0 ? (
            <Loading variant="large" />
          ) : (
            <TiersTable
              windowLength={details?.windowLength}
              data={benefitTiers.map((bt) => ({
                commission: bt.rewardFactor.times(100).toFixed(2) + '%',
                discount: bt.discountFactor.times(100).toFixed(2) + '%',
                tier: bt.tier,
                volume: formatNumber(bt.minimumRunningNotionalTakerVolume, 0),
                tierElement: (
                  <div className="rounded-full p-1 w-8 h-8 text-center">
                    {bt.tier}
                  </div>
                ),
                rewardInfrastructureFactor:
                  BigNumber(bt.rewardFactors.infrastructureFactor)
                    .times(100)
                    .toFixed(2) + '%',
                rewardMakerFactor:
                  BigNumber(bt.rewardFactors.makerFactor)
                    .times(100)
                    .toFixed(2) + '%',
                rewardLiquidityFactor:
                  BigNumber(bt.rewardFactors.liquidityFactor)
                    .times(100)
                    .toFixed(2) + '%',
                discountInfrastructureFactor:
                  BigNumber(bt.discountFactors.infrastructureFactor)
                    .times(100)
                    .toFixed(2) + '%',
                discountMakerFactor:
                  BigNumber(bt.discountFactors.makerFactor)
                    .times(100)
                    .toFixed(2) + '%',
                discountLiquidityFactor:
                  BigNumber(bt.discountFactors.liquidityFactor)
                    .times(100)
                    .toFixed(2) + '%',
                epochs: bt.epochs,
              }))}
            />
          )}
        </div>

        {/* Staking tiers */}
        <div className="flex flex-col mb-5">
          <h3 className="text-2xl calt">{t('Staking multipliers')}</h3>
          <p className="text-sm text-surface-2-fg ">
            {t(
              'Referrers can access the commission multipliers defined in the program by staking VEGA tokens in the amounts shown.'
            )}
          </p>
        </div>
        <div className="gap-5 grid lg:grid-cols-3">
          {loading ? (
            <>
              <Loading variant="large" />
              <Loading variant="large" />
              <Loading variant="large" />
            </>
          ) : (
            <StakingTiers data={stakingTiers} />
          )}
        </div>
      </div>
    </>
  );
};

const StakingTiers = ({ data }: { data?: ReferralStakingTier[] }) => {
  const t = useT();
  if (!data || data.length === 0) {
    return (
      <span className="text-xs text-surface-0-fg-muted">
        {t('Currently not available')}
      </span>
    );
  }
  return (
    <>
      {data.map(
        ({ tier, referralRewardMultiplier, minimumStakedTokens }, i) => (
          <StakingTier
            key={i}
            tier={tier}
            max={data.length}
            referralRewardMultiplier={referralRewardMultiplier}
            minimumStakedTokens={minimumStakedTokens}
          />
        )
      )}
    </>
  );
};

const TiersTable = ({
  data,
  windowLength,
}: {
  data: Array<{
    tier: number;
    tierElement: ReactNode;
    commission: string;
    discount: string;
    volume: string;
    rewardInfrastructureFactor?: string;
    rewardMakerFactor?: string;
    rewardLiquidityFactor?: string;
    discountInfrastructureFactor?: string;
    discountMakerFactor?: string;
    discountLiquidityFactor?: string;
  }>;
  windowLength?: number;
}) => {
  const t = useT();
  const [showFactors, setShowFactors] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => {
          setShowFactors(!showFactors);
        }}
        className="text-surface-0-fg-muted text-xs self-end mr-1"
      >
        <VegaIcon name={VegaIconNames.BREAKDOWN} />
      </button>
      <Table
        columns={compact([
          { name: 'tierElement', displayName: t('Tier') },
          {
            name: 'commission',
            displayName: t('Referrer commission'),
            tooltip: t(
              "The proportion of the referee's fees to be rewarded to the referrer"
            ),
            className: '',
          },
          showFactors && {
            name: 'rewardInfrastructureFactor',
            displayName: (
              <span>
                r<sub>i</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker infrastructure fees to be rewarded to the referrer"
            ),
            className: 'text-xs',
          },
          showFactors && {
            name: 'rewardMakerFactor',
            displayName: (
              <span>
                r<sub>m</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker maker fees to be rewarded to the referrer"
            ),
            className: 'text-xs',
          },
          showFactors && {
            name: 'rewardLiquidityFactor',
            displayName: (
              <span>
                r<sub>l</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker liquidity fees to be rewarded to the referrer"
            ),
            className: 'text-xs',
          },
          {
            name: 'discount',
            displayName: t('Referee trading discount'),
            tooltip: t("The proportion of the referee's fees to be discounted"),
          },
          showFactors && {
            name: 'discountInfrastructureFactor',
            displayName: (
              <span>
                d<sub>i</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker infrastructure fees to be discounted"
            ),
            className: 'text-xs',
          },
          showFactors && {
            name: 'discountMakerFactor',
            displayName: (
              <span>
                d<sub>m</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker maker fees to be discounted"
            ),
            className: 'text-xs',
          },
          showFactors && {
            name: 'discountLiquidityFactor',
            displayName: (
              <span>
                d<sub>l</sub>
              </span>
            ),
            tooltip: t(
              "The proportion of the referee's taker liquidity fees to be discounted"
            ),
            className: 'text-xs',
          },
          {
            name: 'volume',
            displayName: t(
              'minTradingVolume',
              'Min. trading volume (last {{count}} epochs)',
              {
                count: windowLength,
              }
            ),
            tooltip: t(
              'The minimum running notional for the given benefit tier'
            ),
          },
          {
            name: 'epochs',
            displayName: t('Min. epochs'),
            tooltip: t(
              'The minimum number of epochs the party needs to be in the referral set to be eligible for the benefit'
            ),
          },
        ])}
        className="bg-white dark:bg-black"
        data={data.map((d) => ({
          ...d,
          className: cn(getTierGradient(d.tier, data.length)),
        }))}
      />
    </div>
  );
};
