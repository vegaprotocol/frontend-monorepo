import { Button } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { useAddAssetToWallet } from '../../hooks/use-add-asset-to-wallet';

export const AddTokenButtonLink = ({
  address,
  symbol,
  decimals,
  image,
}: {
  address: string;
  symbol: string;
  decimals: number;
  image: string;
}) => {
  const { t } = useTranslation();
  const { add, addSupported } = useAddAssetToWallet(
    address,
    symbol,
    decimals,
    image
  );
  if (!addSupported) {
    return null;
  }
  return (
    <Button variant="inline-link" className="add-token-button" onClick={add}>
      {t('addTokenToWallet')}
    </Button>
  );
};

export const AddTokenButton = ({
  address,
  symbol,
  decimals,
  image,
  size = 32,
  className = '',
}: {
  address: string;
  symbol: string;
  decimals: number;
  image: string;
  size?: number;
  className?: string;
}) => {
  const { add, addSupported } = useAddAssetToWallet(
    address,
    symbol,
    decimals,
    image
  );
  if (!addSupported) {
    return null;
  }
  return (
    <Button variant="inline-link" className="add-token-button" onClick={add}>
      <img
        className={className}
        style={{ width: size, height: size }}
        alt="token-logo"
        src={image}
      />
    </Button>
  );
};
