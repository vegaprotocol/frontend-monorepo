import { t } from '@vegaprotocol/i18n';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { PositionsManager } from './positions-manager';

export const PositionsContainer = ({
  onMarketClick,
  noBottomPlaceholder,
  storeKey,
  allKeys,
}: {
  onMarketClick?: (marketId: string) => void;
  noBottomPlaceholder?: boolean;
  storeKey?: string;
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

  return (
    <PositionsManager
      partyIds={
        allKeys && pubKeys
          ? pubKeys?.map(({ publicKey }) => publicKey)
          : [pubKey]
      }
      onMarketClick={onMarketClick}
      isReadOnly={isReadOnly}
      noBottomPlaceholder={noBottomPlaceholder}
      storeKey={storeKey}
    />
  );
};
