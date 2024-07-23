import { Link, useSearchParams } from 'react-router-dom';
import {
  Intent,
  TradingAnchorButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useDialogStore } from '@vegaprotocol/wallet-react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { RainbowButton } from '../../components/rainbow-button';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { Box } from '../../components/competitions/box';
import { Links } from '../../lib/links';
import { TeamForm, TransactionType } from './team-form';
import { Role, useMyTeam } from '../../lib/hooks/use-my-team';

export const CompetitionsCreateTeam = () => {
  const [searchParams] = useSearchParams();
  const isSolo = Boolean(searchParams.get('solo'));
  const t = useT();

  usePageTitle(t('Create a team'));

  const { isReadOnly, pubKey } = useVegaWallet();
  const openWalletDialog = useDialogStore((store) => store.open);

  const canShowForm = pubKey && !isReadOnly;

  const { role, teamId } = useMyTeam();
  const isUpgrade = Boolean(teamId && role === Role.NOT_IN_TEAM_BUT_REFERRER);

  let title = t('Create a team');
  if (isUpgrade) title = t('Upgrade to team');
  if (isSolo) {
    title = t('Create solo team');
    if (isUpgrade) {
      title = t('Upgrade to solo team');
    }
  }

  return (
    <ErrorBoundary feature="create-team">
      <div className="mx-auto md:w-2/3 max-w-xl">
        <Box className="flex flex-col gap-4">
          <Link
            to={Links.COMPETITIONS()}
            className="text-xs inline-flex items-center gap-1 group"
          >
            <VegaIcon
              name={VegaIconNames.CHEVRON_LEFT}
              size={12}
              className="text-vega-clight-100 dark:text-vega-cdark-100"
            />{' '}
            <span className="group-hover:underline">
              {t('Go back to the competitions')}
            </span>
          </Link>
          <h1 className="calt text-2xl lg:text-3xl xl:text-4xl">{title}</h1>
          {canShowForm ? (
            <CreateTeamFormContainer
              isSolo={isSolo}
              isUpgrade={isUpgrade}
              teamId={teamId}
            />
          ) : (
            <>
              <p>
                {t(
                  'Create a team to participate in team based rewards as well as access the discount benefits of the current referral program.'
                )}
              </p>
              <RainbowButton variant="border" onClick={openWalletDialog}>
                {t('Connect wallet')}
              </RainbowButton>
            </>
          )}
          {isUpgrade && (
            <p className="text-sm mt-1">
              {t(
                'Note that your existing referees will not be automatically added to your team. Share your team profile to have them join you in competitions. You will still earn commission from their trading even if they do not join.'
              )}
            </p>
          )}
        </Box>
      </div>
    </ErrorBoundary>
  );
};

const CreateTeamFormContainer = ({
  isSolo,
  isUpgrade,
  teamId,
}: {
  isSolo: boolean;
  isUpgrade: boolean;
  teamId?: string;
}) => {
  const t = useT();
  const createLink = useLinks(DApp.Governance);

  const { err, status, code, isEligible, requiredStake, onSubmit } =
    useReferralSetTransaction({
      onSuccess: (code) => {
        // For some reason team creation takes a long time, too long even to make
        // polling viable, so its not feasible to navigate to the team page
        // after creation
        //
        // navigate(Links.COMPETITIONS_TEAM(code));
      },
    });

  const teamCode = (isUpgrade ? teamId : code) || '';

  if (status === 'confirmed') {
    return (
      <div
        className="flex flex-col items-start gap-2"
        data-testid="team-creation-success-message"
      >
        <p className="text-sm">{t('Team creation transaction successful')}</p>
        {code && (
          <>
            <dl>
              <dt className="text-sm">{t('Your team ID:')}</dt>
              <dl>
                <span
                  className="font-mono break-all bg-rainbow bg-clip-text text-transparent text-2xl"
                  data-testid="team-id-display"
                >
                  {teamCode}
                </span>
              </dl>
            </dl>
            <TradingAnchorButton
              href={Links.COMPETITIONS_TEAM(teamCode)}
              intent={Intent.Info}
              size="small"
              data-testid="view-team-button"
            >
              {t('View team')}
            </TradingAnchorButton>
          </>
        )}
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="flex flex-col gap-4">
        {requiredStake !== undefined && (
          <p>
            {t(
              'You need at least {{requiredStake}} VEGA staked to generate a referral code and participate in the referral program.',
              {
                requiredStake: addDecimalsFormatNumber(
                  requiredStake.toString(),
                  18
                ),
              }
            )}
          </p>
        )}
        <TradingAnchorButton
          href={createLink(TokenStaticLinks.ASSOCIATE)}
          intent={Intent.Primary}
          target="_blank"
        >
          {t('Stake some $VEGA now')}
        </TradingAnchorButton>
      </div>
    );
  }

  return (
    <TeamForm
      type={
        isUpgrade
          ? TransactionType.UpgradeFromReferralSet
          : TransactionType.CreateReferralSet
      }
      onSubmit={onSubmit}
      status={status}
      err={err}
      isCreatingSoloTeam={isSolo}
      defaultValues={
        isUpgrade && teamId
          ? {
              allowList: '',
              avatarUrl: '',
              id: teamId,
              name: '',
              private: isSolo,
              url: '',
            }
          : undefined
      }
    />
  );
};
