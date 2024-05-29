import { TradingCheckbox } from '@vegaprotocol/ui-toolkit';
import { usePositionsStore } from '../positions-container';
import { useT } from '../../lib/use-t';

export const PositionsMenu = () => {
  const t = useT();
  const checked = usePositionsStore((store) => store.showClosedMarkets);
  const onCheckedChange = usePositionsStore(
    (store) => store.toggleClosedMarkets
  );
  return (
    <TradingCheckbox
      data-testid="toggle-show-closed-positions"
      label={t('Show closed positions')}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  );
};
