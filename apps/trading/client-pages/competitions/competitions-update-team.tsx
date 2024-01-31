import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Box } from '../../components/competitions/box';
import { useT } from '../../lib/use-t';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { RainbowButton } from '../../components/rainbow-button';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Links } from '../../lib/links';
import { useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { type FormFields, TeamForm, TransactionType } from './team-form';
import { useTeam } from '../../lib/hooks/use-team';
import { LayoutWithGradient } from '../../components/layouts-inner';

export const CompetitionsUpdateTeam = () => {
  const t = useT();
  usePageTitle([t('Competitions'), t('Update a team')]);
  const { pubKey, isReadOnly } = useVegaWallet();
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { teamId } = useParams<{ teamId: string }>();
  if (!teamId) {
    return <Navigate to={Links.COMPETITIONS()} />;
  }

  return (
    <ErrorBoundary feature="update-team">
      <LayoutWithGradient>
        <div className="mx-auto md:w-2/3 max-w-xl">
          <Box className="flex flex-col gap-4">
            <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
              {t('Update a team')}
            </h1>
            {pubKey && !isReadOnly ? (
              <UpdateTeamFormContainer teamId={teamId} pubKey={pubKey} />
            ) : (
              <>
                <p>{t('Connect to update the details of your team.')}</p>
                <RainbowButton variant="border" onClick={openWalletDialog}>
                  {t('Connect wallet')}
                </RainbowButton>
              </>
            )}
          </Box>
        </div>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};

const UpdateTeamFormContainer = ({
  teamId,
  pubKey,
}: {
  teamId: string;
  pubKey: string;
}) => {
  const t = useT();
  const { team, loading, error } = useTeam(teamId, pubKey);

  const { err, status, onSubmit } = useReferralSetTransaction({
    onSuccess: () => {
      // NOOP
    },
  });

  if (loading) {
    return <Loader size="small" />;
  }
  if (error) {
    return (
      <Splash className="gap-1">
        <span>{t('Something went wrong.')}</span>
        <Link to={Links.COMPETITIONS_TEAM(teamId)} className="underline">
          {t("Go back to the team's profile")}
        </Link>
      </Splash>
    );
  }

  const isMyTeam = team?.referrer === pubKey;
  if (!isMyTeam) {
    return <Navigate to={Links.COMPETITIONS_TEAM(teamId)} />;
  }

  const defaultValues: FormFields = {
    id: team.teamId,
    name: team.name,
    url: team.teamUrl,
    avatarUrl: team.avatarUrl,
    private: team.closed,
    allowList: team.allowList.join(','),
  };

  return (
    <TeamForm
      type={TransactionType.UpdateReferralSet}
      status={status}
      err={err}
      isSolo={team.closed}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    />
  );
};
