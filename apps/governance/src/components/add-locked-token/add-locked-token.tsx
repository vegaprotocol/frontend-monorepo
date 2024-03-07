import { useTranslation } from 'react-i18next';

import { useAddAssetSupported } from '../../hooks/use-add-asset-to-wallet';
import vegaVesting from '../../images/vega_vesting.png';
import { AddTokenButtonLink } from '../add-token-button/add-token-button';
import { Callout } from '@vegaprotocol/ui-toolkit';
import { ENV } from '../../config/env';

export const AddLockedTokenAddress = () => {
  const { t } = useTranslation();
  const addSupported = useAddAssetSupported();
  return (
    <Callout
      title={t(
        'New Keep track of locked tokens in your wallet with the VEGA (VESTING) token.'
      )}
    >
      {addSupported ? (
        <>
          <p className="flex justify-center">
            <AddTokenButtonLink
              address={ENV.addresses.lockedAddress}
              symbol="VEGA🔒"
              decimals={18}
              image={vegaVesting}
            />
          </p>
          <div className="flex my-2 gap-4">
            <hr className="flex-1 mt-4" />
            {t('Or')} <hr className="flex-1 mt-4" />
          </div>
        </>
      ) : null}
      <p className="mb-0">
        {t(
          'The token address is {{address}}. Hit the add token button in your ERC20 wallet and enter this address.',
          {
            address: ENV.addresses.lockedAddress,
          }
        )}
      </p>
    </Callout>
  );
};
