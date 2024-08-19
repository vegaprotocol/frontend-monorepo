import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Box } from '../../components/competitions/box';
import { useT } from '../../lib/use-t';
import {
  useVegaWallet,
  useDialogStore,
  TxStatus,
} from '@vegaprotocol/wallet-react';
import {
  Loader,
  Splash,
  TradingDialog,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { RainbowButton } from '../../components/rainbow-button';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Links } from '../../lib/links';
import { useReferralSetTransaction } from '../../lib/hooks/use-referral-set-transaction';
import { type FormFields, TeamForm, TransactionType } from './team-form';
import { useTeam } from '../../lib/hooks/use-team';
import { useEffect, useState } from 'react';
import type {
  CreateReferralSet,
  UpdateReferralSet,
} from '@vegaprotocol/wallet';
import { TransactionSteps } from '../../components/transaction-dialog/transaction-steps';

export const CompetitionsUpdateTeam = () => {
  const t = useT();
  usePageTitle([t('Competitions'), t('Update a team')]);
  const { pubKey, isReadOnly } = useVegaWallet();
  const openWalletDialog = useDialogStore((store) => store.open);
  const { teamId } = useParams<{ teamId: string }>();
  if (!teamId) {
    return <Navigate to={Links.COMPETITIONS()} />;
  }

  return (
    <ErrorBoundary feature="update-team">
      <div className="mx-auto md:w-2/3 max-w-xl">
        <Box className="flex flex-col gap-4">
          <Link
            to={Links.COMPETITIONS_TEAM(teamId)}
            className="text-xs inline-flex items-center gap-1 group"
          >
            <VegaIcon
              name={VegaIconNames.CHEVRON_LEFT}
              size={12}
              className="text-surface-1-fg "
            />{' '}
            <span className="group-hover:underline">
              {t('Go back to the team profile')}
            </span>
          </Link>
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
  const [refetching, setRefetching] = useState<boolean>(false);
  const { team, loading, error, refetch } = useTeam(teamId, pubKey);

  const {
    err,
    status,
    result,
    reset,
    onSubmit: submit,
  } = useReferralSetTransaction({
    onSuccess: () => {
      // NOOP
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();

  const onSubmit = (tx: CreateReferralSet | UpdateReferralSet) => {
    submit(tx);
    setDialogOpen(true);
  };

  // refetch when saved
  useEffect(() => {
    if (refetch && status === TxStatus.Confirmed) {
      refetch();
      setRefetching(true);
    }
  }, [refetch, status]);

  if (loading && !refetching) {
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
    <>
      <TeamForm
        type={TransactionType.UpdateReferralSet}
        status={status}
        err={err}
        isCreatingSoloTeam={team.closed}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
      <TradingDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
        title={t('Update a team')}
      >
        <TransactionSteps
          status={status}
          result={result}
          error={err || undefined}
          reset={() => {
            reset();
            setDialogOpen(false);
            if (status === TxStatus.Confirmed) {
              navigate(Links.COMPETITIONS_TEAM(teamId));
            }
          }}
          resetLabel={
            status === TxStatus.Confirmed ? t('View team') : t('Back')
          }
          confirmedLabel={t('Changes successfully saved to your team.')}
        />
      </TradingDialog>
    </>
  );
};
