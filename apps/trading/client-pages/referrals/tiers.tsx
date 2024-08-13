import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { useReferralProgram } from './hooks/use-referral-program';
import { Table } from '../../components/table';
import { cn } from '@vegaprotocol/ui-toolkit';
import { BORDER_COLOR, GRADIENT } from './constants';
import { Tag } from '../../components/helpers/tag';
import { getTierColor, getTierGradient } from '../../components/helpers/tiers';
import type { ReactNode } from 'react';
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

const Loading = ({ variant }: { variant: 'large' | 'inline' }) => (
  <div
    className={cn('bg-gs-800  rounded-lg animate-pulse', {
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
        'border rounded-md w-full',
        'flex flex-row',
        'bg-gs-900',
        GRADIENT,
        BORDER_COLOR
      )}
    >
      <div className={cn('p-3 flex flex-row min-h-[80px] h-full items-center')}>
        <div>
          <Tag color={getTierColor(tier, max)}>
            {t('Multiplier')} {referralRewardMultiplier}x
          </Tag>
          <p className="mt-1 text-sm text-gs-100 ">
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
      <div className="bg-gs-800  text-black dark:text-white rounded-lg p-6 mt-1 mb-20 text-sm text-center">
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
      <div className="mb-2 flex flex-row items-baseline justify-between text-xs text-gs-100  font-alt calt">
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
          'md:bg-gs-800',
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
          <p className="text-sm text-gs-200 ">
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
                  <div className="rounded-full bg-gs-900  p-1 w-8 h-8 text-center">
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
          <p className="text-sm text-gs-200 ">
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
        max={data.length}
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
      className="bg-gs-0"
      data={data.map((d) => ({
        ...d,
        className: cn(getTierGradient(d.tier, data.length)),
      }))}
    />
  );
};
