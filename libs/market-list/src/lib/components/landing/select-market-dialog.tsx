import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { MarketsContainer } from '../markets-container';

export interface SelectMarketListProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export const SelectMarketDialog = ({
  dialogOpen,
  setDialogOpen,
}: SelectMarketListProps) => {
  return (
    <Dialog
      title={t('Select a market')}
      intent={Intent.Primary}
      open={dialogOpen}
      onChange={() => setDialogOpen(false)}
      titleClassNames="font-bold font-sans text-3xl tracking-tight mb-0 pl-8"
      contentClassNames="w-full md:w-[1120px]"
    >
      <div className="h-[200px] w-full">
        <MarketsContainer />
      </div>
    </Dialog>
  );
};
