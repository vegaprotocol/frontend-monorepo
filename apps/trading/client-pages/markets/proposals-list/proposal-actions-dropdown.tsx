import {
  TradingDropdownItem,
  VegaIcon,
  VegaIconNames,
  Link,
  ActionsDropdown,
} from '@vegaprotocol/ui-toolkit';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useT } from '../../../lib/use-t';

export const ProposalActionsDropdown = ({ id }: { id: string }) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Governance);

  return (
    <ActionsDropdown data-testid="proposal-actions-content">
      <TradingDropdownItem>
        <Link
          href={linkCreator(TOKEN_PROPOSAL.replace(':id', id))}
          target="_blank"
          className="flex items-center gap-2"
        >
          <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
          {t('View proposal')}
        </Link>
      </TradingDropdownItem>
    </ActionsDropdown>
  );
};
