import {
  AssetDetailsDialog,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { useUpdateProposal } from '@vegaprotocol/proposals';
import * as Schema from '@vegaprotocol/types';

export const LocalAssetDetailsDialog = () => {
  const { isOpen, id, trigger, setOpen } = useAssetDetailsDialogStore();
  const { data: proposal } = useUpdateProposal({
    id,
    proposalType: Schema.ProposalType.TYPE_UPDATE_ASSET,
  });
  return (
    <AssetDetailsDialog
      assetId={id}
      trigger={trigger || null}
      open={isOpen}
      onChange={setOpen}
      proposalId={proposal?.id ?? undefined}
    />
  );
};
