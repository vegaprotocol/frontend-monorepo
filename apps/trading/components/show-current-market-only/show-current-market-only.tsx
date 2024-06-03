import { TradingCheckbox } from '@vegaprotocol/ui-toolkit';
import {
  useShowCurrentMarketOnly,
  useShowCurrentMarketOnlyStore,
} from '../../lib/hooks/use-show-current-market-only';
import { useT } from '../../lib/use-t';

export const ShowCurrentMarketOnly = () => {
  const t = useT();
  const showCurrentMarketOnly = useShowCurrentMarketOnly();
  const toggleShowCurrentMarketOnly = useShowCurrentMarketOnlyStore(
    (state) => state.toggleShowCurrentMarketOnly
  );
  return (
    <TradingCheckbox
      label={t('Show current market only')}
      checked={showCurrentMarketOnly}
      onCheckedChange={toggleShowCurrentMarketOnly}
    />
  );
};
