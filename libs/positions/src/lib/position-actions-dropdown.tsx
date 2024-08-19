import {
  ActionsDropdown,
  DropdownMenuItem,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useT } from '../use-t';

export const PositionActionsDropdown = ({ assetId }: { assetId: string }) => {
  const t = useT();
  const open = useAssetDetailsDialogStore((store) => store.open);

  return (
    <ActionsDropdown data-testid="position-actions-content">
      <DropdownMenuItem
        onClick={(e) => {
          open(assetId, e.target as HTMLElement);
        }}
      >
        <VegaIcon name={VegaIconNames.INFO} size={16} />
        {t('View settlement asset details')}
      </DropdownMenuItem>
    </ActionsDropdown>
  );
};
