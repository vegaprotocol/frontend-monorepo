import { type QueryKey } from '@tanstack/react-query';
import { type AssetERC20 } from '@vegaprotocol/assets';

import { useT } from '../../lib/use-t';
import { useEvmFaucet } from '../../lib/hooks/use-evm-faucet';
import { FormSecondaryActionButton } from '../form-secondary-action';

export const Faucet = ({
  asset,
  queryKey,
}: {
  asset: AssetERC20;
  queryKey: QueryKey;
}) => {
  const t = useT();
  const { write } = useEvmFaucet({ asset });

  // If no faucet function useSimulate contract failed and this
  // function is not available
  if (!write) return null;

  return (
    <FormSecondaryActionButton onClick={write}>
      {t('Get {{symbol}}', { symbol: asset.symbol })}
    </FormSecondaryActionButton>
  );
};
