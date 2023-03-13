import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PositionsManager } from './positions-manager';

export const PositionsContainer = ({
  onMarketClick,
  noBottomPlaceholder,
}: {
  onMarketClick?: (marketId: string) => void;
  noBottomPlaceholder?: boolean;
}) => {
  const { pubKey, isReadOnly } = useVegaWallet();

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }
  return (
    <PositionsManager
      partyId={pubKey}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      noBottomPlaceholder={noBottomPlaceholder}
    />
  );
};
