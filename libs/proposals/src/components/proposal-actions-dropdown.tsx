import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useRef } from 'react';

export const ProposalActionsDropdown = ({ id }: { id: string }) => {
  const linkCreator = useLinks(DApp.Token);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) ref.current?.classList.add('open');
        if (!open) ref.current?.classList.remove('open');
      }}
      trigger={
        <DropdownMenuTrigger
          className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 [&.open]:bg-vega-light-200 dark:[&.open]:bg-vega-dark-200 p-0.5 rounded-full"
          data-testid="dropdown-menu"
          ref={ref}
        >
          <VegaIcon name={VegaIconNames.KEBAB} />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent data-testid="market-actions-content">
        <DropdownMenuItem>
          <Link
            href={linkCreator(TOKEN_PROPOSAL.replace(':id', id))}
            target="_blank"
          >
            <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
            {t('View proposal')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
