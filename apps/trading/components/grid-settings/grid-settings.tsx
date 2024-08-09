import { useT } from '../../lib/use-t';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { Button } from '@vegaprotocol/ui-toolkit';

export const GridSettings = ({
  updateGridStore,
}: {
  updateGridStore: (gridStore: DataGridStore) => void;
}) => {
  const t = useT();
  return (
    <Button
      onClick={() =>
        updateGridStore({
          columnState: undefined,
          filterModel: undefined,
        })
      }
      size="xs"
    >
      {t('Reset Columns')}
    </Button>
  );
};
