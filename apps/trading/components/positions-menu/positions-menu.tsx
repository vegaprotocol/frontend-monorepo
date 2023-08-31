import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { usePositionsStore } from '../positions-container';

export const PositionsMenu = () => {
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
