import { useVegaWallet } from '@vegaprotocol/wallet';
import { type Team } from './hooks/use-team';
import { Intent, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';

export const UpdateTeamButton = ({ team }: { team: Team }) => {
  const { pubKey, isReadOnly } = useVegaWallet();

  if (pubKey && !isReadOnly && pubKey === team.referrer) {
    return (
      <TradingAnchorButton
        data-testid="update-team-button"
        href={Links.COMPETITIONS_UPDATE_TEAM(team.teamId)}
        intent={Intent.Info}
      />
    );
  }

  return null;
};
