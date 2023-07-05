import {
  DropdownMenuItem,
  VegaIcon,
  VegaIconNames,
  Link,
  ActionsDropdown,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';

export const ProposalActionsDropdown = ({ id }: { id: string }) => {
  const linkCreator = useLinks(DApp.Token);

  return (
    <ActionsDropdown data-testid="market-actions-content">
      <DropdownMenuItem>
        <Link
          href={linkCreator(TOKEN_PROPOSAL.replace(':id', id))}
          target="_blank"
        >
          <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
          {t('View proposal')}
        </Link>
      </DropdownMenuItem>
    </ActionsDropdown>
  );
};
