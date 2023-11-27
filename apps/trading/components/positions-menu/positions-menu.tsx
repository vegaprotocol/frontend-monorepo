import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { usePositionsStore } from '../positions-container';
import { useT } from '../../lib/use-t';

export const PositionsMenu = () => {
  const t = useT();
  const showClosed = usePositionsStore((store) => store.showClosedMarkets);
  const toggle = usePositionsStore((store) => store.toggleClosedMarkets);
  return (
    <TradingButton
      size="extra-small"
      data-testid="open-transfer"
      onClick={toggle}
    >
      {showClosed ? t('Hide closed markets') : t('Show closed markets')}
    </TradingButton>
  );
};
