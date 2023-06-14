import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PositionsManager } from './positions-manager';

export const PositionsContainer = ({
  onMarketClick,
  noBottomPlaceholder,
  allKeys,
}: {
  onMarketClick?: (marketId: string) => void;
  noBottomPlaceholder?: boolean;
  allKeys?: boolean;
}) => {
  const { pubKey, pubKeys, isReadOnly } = useVegaWallet();

  if (!pubKey) {
    return (
      <Splash>
        <p>{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  const partyIds = [pubKey];
  if (allKeys && pubKeys) {
    partyIds.push(
      ...pubKeys
        .map(({ publicKey }) => publicKey)
        .filter((publicKey) => publicKey !== pubKey)
    );
  }

  return (
    <PositionsManager
      partyIds={partyIds}
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      noBottomPlaceholder={noBottomPlaceholder}
    />
  );
};
