import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { useReferralProgram } from './hooks/use-referral-program';
import { Table } from './table';
import classNames from 'classnames';
import { BORDER_COLOR, GRADIENT } from './constants';
import { Tag } from './tag';
import type { ComponentProps, ReactNode } from 'react';
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

// rainbow-ish order
const TIER_COLORS: Array<ComponentProps<typeof Tag>['color']> = [
  'pink',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
];

const getTierColor = (tier: number) => {
  const tiers = Object.keys(TIER_COLORS).length;
  let index = Math.abs(tier - 1);
  if (tier >= tiers) {
    index = index % tiers;
  }
  return TIER_COLORS[index];
};

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
  referralRewardMultiplier,
  minimumStakedTokens,
}: {
  tier: number;
  referralRewardMultiplier: string;
  minimumStakedTokens: string;
}) => {
  const t = useT();
  const minimum = addDecimalsFormatNumber(minimumStakedTokens, 18);

  // TODO: Decide what to do with the multiplier images
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const multiplierImage = (
    <div
      aria-hidden
      className={classNames(
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
      className={classNames(
        'overflow-hidden',
        'border rounded-md w-full',
        'flex flex-row',
        'bg-white dark:bg-vega-cdark-900',
        GRADIENT,
        BORDER_COLOR
      )}
    >
      <div
        className={classNames(
          'p-3 flex flex-row min-h-[80px] h-full items-center'
        )}
      >
        <div>
          <Tag color={getTierColor(tier)}>
            {t('Multiplier')} {referralRewardMultiplier}x
          </Tag>
          <p className="mt-1 text-sm text-vega-clight-100 dark:text-vega-cdark-100">
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
  const { benefitTiers, stakingTiers, details, loading, error } =
    useReferralProgram();

  const ends = details?.endOfProgramTimestamp
    ? getDateTimeFormat().format(new Date(details.endOfProgramTimestamp))
    : undefined;

  const governanceLink = useLinks(DApp.Governance);

  if ((!loading && !details) || error) {
    return (
      <div className="bg-vega-clight-800 dark:bg-vega-cdark-800 text-black dark:text-white rounded-lg p-6 mt-1 mb-20 text-sm text-center">
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
      <h2 className="text-3xl mt-10">{t('Current program details')}</h2>
      {details?.id && (
        <p>
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
      <div className="mt-10 flex flex-row items-baseline justify-between text-xs text-vega-clight-100 dark:text-vega-cdark-100 font-alpha calt">
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
      <div className="bg-vega-clight-800 dark:bg-vega-cdark-800 text-black dark:text-white rounded-lg p-6 mt-1 mb-20">
        {/* Benefit tiers */}
        <div className="flex flex-col mb-5">
          <h3 className="text-2xl calt">{t('Benefit tiers')}</h3>
          <p className="text-sm text-vega-clight-200 dark:text-vega-cdark-200">
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
                ...bt,
                tierElement: (
                  <div className="rounded-full bg-vega-clight-900 dark:bg-vega-cdark-900 p-1 w-8 h-8 text-center">
                    {bt.tier}
                  </div>
                ),
              }))}
            />
          )}
        </div>

        {/* Staking tiers */}
        <div className="flex flex-col mb-5">
          <h3 className="text-2xl calt">{t('Staking multipliers')}</h3>
          <p className="text-sm text-vega-clight-200 dark:text-vega-cdark-200">
            {t(
              'Referrers can access the commission multipliers defined in the program by staking VEGA tokens in the amounts shown.'
            )}
          </p>
        </div>
        <div className="gap-5 grid lg:grid-cols-3">
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
    {data.map(({ tier, referralRewardMultiplier, minimumStakedTokens }, i) => (
      <StakingTier
        key={i}
        tier={tier}
        referralRewardMultiplier={referralRewardMultiplier}
        minimumStakedTokens={minimumStakedTokens}
      />
    ))}
  </>
);

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
  }>;
  windowLength?: number;
}) => {
  const t = useT();
  return (
    <Table
      columns={[
        { name: 'tierElement', displayName: t('Tier') },
        {
          name: 'commission',
          displayName: t('Referrer commission'),
          tooltip: t(
            "The proportion of the referee's taker fees to be rewarded to the referrer"
          ),
        },
        {
          name: 'discount',
          displayName: t('Referee trading discount'),
          tooltip: t(
            "The proportion of the referee's taker fees to be discounted"
          ),
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
          tooltip: t('The minimum running notional for the given benefit tier'),
        },
        {
          name: 'epochs',
          displayName: t('Min. epochs'),
          tooltip: t(
            'The minimum number of epochs the party needs to be in the referral set to be eligible for the benefit'
          ),
        },
      ]}
      className="bg-white dark:bg-vega-cdark-900"
      data={data.map((d) => ({
        ...d,
        className: classNames({
          'from-vega-yellow-400 dark:from-vega-yellow-600 to-20%  bg-highlight':
            'yellow' === getTierColor(d.tier),
          'from-vega-green-400 dark:from-vega-green-600 to-20%  bg-highlight':
            'green' === getTierColor(d.tier),
          'from-vega-blue-400 dark:from-vega-blue-600 to-20%  bg-highlight':
            'blue' === getTierColor(d.tier),
          'from-vega-purple-400 dark:from-vega-purple-600 to-20%  bg-highlight':
            'purple' === getTierColor(d.tier),
          'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight':
            'pink' === getTierColor(d.tier),
          'from-vega-orange-400 dark:from-vega-orange-600 to-20%  bg-highlight':
            'orange' === getTierColor(d.tier),
          'from-vega-clight-200 dark:from-vega-cdark-200 to-20%  bg-highlight':
            'none' === getTierColor(d.tier),
        }),
      }))}
    />
  );
};
