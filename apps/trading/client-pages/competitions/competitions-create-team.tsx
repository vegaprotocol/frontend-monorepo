import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CopyWithTooltip,
  Intent,
  AnchorButton,
  Button,
  Dialog,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useVegaWallet,
  useDialogStore,
  TxStatus,
} from '@vegaprotocol/wallet-react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { Box } from '../../components/competitions/box';
import { Links } from '../../lib/links';
import { TeamForm, TransactionType } from './team-form';
import { Role, useMyTeam } from '../../lib/hooks/use-my-team';
import { useState } from 'react';
import type {
  CreateReferralSet,
  UpdateReferralSet,
} from '@vegaprotocol/wallet';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';

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
    title = t('Create my profile');
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
            className="underline underline-offset-4 inline-flex items-center gap-1"
          >
            <VegaIcon name={VegaIconNames.CHEVRON_LEFT} />{' '}
            <span>{t('Go back to the competitions')}</span>
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
              <Button
                intent={Intent.Primary}
                size="lg"
                onClick={openWalletDialog}
              >
                {t('Connect wallet')}
              </Button>
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
  const navigate = useNavigate();

  const {
    err,
    status,
    result,
    reset,
    code,
    isEligible,
    requiredStake,
    onSubmit: submit,
  } = useReferralSetTransaction({
    onSuccess: () => {
      // NOOP
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const onSubmit = (tx: CreateReferralSet | UpdateReferralSet) => {
    submit(tx);
    setDialogOpen(true);
  };

  const teamCode = (isUpgrade ? teamId : code) || '';

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
        <AnchorButton
          href={createLink(TokenStaticLinks.ASSOCIATE)}
          intent={Intent.Primary}
          target="_blank"
        >
          {t('Stake some $VEGA now')}
        </AnchorButton>
      </div>
    );
  }

  return (
    <>
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
      <Dialog
        open={dialogOpen}
        onChange={(open) => {
          setDialogOpen(open);
        }}
        title={t('Create a team')}
      >
        <TransactionSteps
          status={status}
          result={result}
          error={err || undefined}
          reset={() => {
            reset();
            setDialogOpen(false);
            if (status === TxStatus.Confirmed) {
              navigate(Links.COMPETITIONS_TEAM(teamCode));
            }
          }}
          resetLabel={
            status === TxStatus.Confirmed ? t('View team') : t('Back')
          }
          confirmedLabel={
            teamCode ? (
              <div className="flex flex-col justify-start items-start gap-0 w-full">
                <span data-testid="team-creation-success-message">
                  {t('Team creation transaction successful')}
                </span>

                <div className="flex gap-1 max-w-full overflow-hidden">
                  <span className="truncate">{teamCode}</span>

                  <CopyWithTooltip text={teamCode}>
                    <Button
                      size="xs"
                      icon={<VegaIcon name={VegaIconNames.COPY} />}
                    >
                      <span>{t('Copy')}</span>
                    </Button>
                  </CopyWithTooltip>
                </div>
              </div>
            ) : (
              <span data-testid="team-creation-success-message">
                {t('Team creation transaction successful')}
              </span>
            )
          }
        />
      </Dialog>
    </>
  );
};
