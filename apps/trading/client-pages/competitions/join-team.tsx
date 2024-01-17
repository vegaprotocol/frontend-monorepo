import {
  TradingButton as Button,
  Dialog,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  useSimpleTransaction,
  useVegaWallet,
  type Status,
} from '@vegaprotocol/wallet';
import { useT } from '../../lib/use-t';
import { type Team } from './hooks/use-team';
import { useState } from 'react';

type JoinType = 'switch' | 'join';

export const JoinTeam = ({
  team,
  partyTeam,
  refetch,
}: {
  team: Team;
  partyTeam?: Team;
  refetch: () => void;
}) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { send, status } = useSimpleTransaction({
    onSuccess: refetch,
  });
  const [confirmDialog, setConfirmDialog] = useState<JoinType>();

  const joinTeam = () => {
    send({
      joinTeam: {
        id: team.teamId,
      },
    });
  };

  return (
    <>
      <JoinButton
        team={team}
        partyTeam={partyTeam}
        pubKey={pubKey}
        isReadOnly={isReadOnly}
        onJoin={setConfirmDialog}
      />
      <Dialog
        open={confirmDialog !== undefined}
        onChange={() => setConfirmDialog(undefined)}
      >
        {confirmDialog !== undefined && (
          <DialogContent
            type={confirmDialog}
            status={status}
            team={team}
            onConfirm={joinTeam}
            onCancel={() => setConfirmDialog(undefined)}
          />
        )}
      </Dialog>
    </>
  );
};

const JoinButton = ({
  pubKey,
  isReadOnly,
  team,
  partyTeam,
  onJoin,
}: {
  pubKey: string | null;
  isReadOnly: boolean;
  team: Team;
  partyTeam?: Team;
  onJoin: (type: JoinType) => void;
}) => {
  const t = useT();

  if (!pubKey || isReadOnly) {
    return (
      <Tooltip description="Connect your wallet to join the team">
        <Button intent={Intent.Primary} disabled={true}>
          {t('Join this team')}{' '}
        </Button>
      </Tooltip>
    );
  }
  // Party is the creator of a team
  else if (partyTeam && partyTeam.referrer === pubKey) {
    // Party is the creator of THIS team
    if (partyTeam.teamId === team.teamId) {
      return (
        <Button intent={Intent.None} disabled={true}>
          <span className="flex items-center gap-2">
            {t('Owner')}{' '}
            <span className="text-vega-green-600 dark:text-vega-green">
              <VegaIcon name={VegaIconNames.TICK} />
            </span>
          </span>
        </Button>
      );
    } else {
      // Not creator of the team, but still can't switch because
      // creators cannot leave their own team
      return (
        <Tooltip description="As a team creator, you cannot switch teams">
          <Button intent={Intent.Primary} disabled={true}>
            {t('Switch team')}{' '}
          </Button>
        </Tooltip>
      );
    }
  }
  // Party is in a team, but not this one
  else if (partyTeam && partyTeam.teamId !== team.teamId) {
    return (
      <Button onClick={() => onJoin('switch')} intent={Intent.Primary}>
        {t('Switch team')}{' '}
      </Button>
    );
  }
  // Joined. Current party is already in this team
  else if (partyTeam && partyTeam.teamId === team.teamId) {
    return (
      <Button intent={Intent.None} disabled={true}>
        <span className="flex items-center gap-2">
          {t('Joined')}{' '}
          <span className="text-vega-green-600 dark:text-vega-green">
            <VegaIcon name={VegaIconNames.TICK} />
          </span>
        </span>
      </Button>
    );
  }

  return (
    <Button onClick={() => onJoin('join')} intent={Intent.Primary}>
      {t('Join this team')}
    </Button>
  );
};

const DialogContent = ({
  type,
  status,
  team,
  onConfirm,
  onCancel,
}: {
  type: JoinType;
  status: Status;
  team: Team;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (status === 'requested') {
    return <p>Confirm in wallet</p>;
  }

  if (status === 'pending') {
    return <p>Waiting for transaction confirmation...</p>;
  }

  if (status === 'confirmed') {
    return <p>Success</p>;
  }

  return (
    <>
      {type === 'switch' && (
        <p className="mb-2">
          Switching team will remove you from your current team
        </p>
      )}
      {type === 'join' && (
        <p className="mb-2">Are you sure you want to join team: {team.name}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={onConfirm} intent={Intent.Success}>
          Confirm
        </Button>
        <Button onClick={onCancel} intent={Intent.Danger}>
          Cancel
        </Button>
      </div>
    </>
  );
};
