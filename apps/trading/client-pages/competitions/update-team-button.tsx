import { useVegaWallet } from '@vegaprotocol/wallet';
import { type Team } from '../../lib/hooks/use-team';
import { Intent, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

export const UpdateTeamButton = ({ team }: { team: Team }) => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();

  if (pubKey && !isReadOnly && pubKey === team.referrer) {
    return (
      <TradingAnchorButton
        data-testid="update-team-button"
        href={Links.COMPETITIONS_UPDATE_TEAM(team.teamId)}
        intent={Intent.Info}
      >
        {t('Update team')}
      </TradingAnchorButton>
    );
  }

  return null;
};
