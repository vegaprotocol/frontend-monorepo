import { useTranslation } from 'react-i18next';

import { useEnvironment } from '@vegaprotocol/react-helpers';
import { useAddAssetSupported } from '../../hooks/use-add-asset-to-wallet';
import vegaVesting from '../../images/vega_vesting.png';
import { AddTokenButtonLink } from '../add-token-button/add-token-button';
import { Callout } from '@vegaprotocol/ui-toolkit';

export const AddLockedTokenAddress = () => {
  const { ADDRESSES } = useEnvironment();
  const { t } = useTranslation();
  const addSupported = useAddAssetSupported();
  return (
    <Callout
      title={t(
        'Keep track of locked tokens in your wallet with the VEGA (VESTING) token.'
      )}
    >
      {addSupported ? (
        <>
          <p className="flex justify-center">
            <AddTokenButtonLink
              address={ADDRESSES.lockedAddress}
              symbol="VEGA🔒"
              decimals={18}
              image={vegaVesting}
            />
          </p>
          <div className="flex my-12 gap-12">
            <hr className="flex-1 mt-8" />
            {t('Or')} <hr className="flex-1 mt-8" />
          </div>
        </>
      ) : null}
      <p className="mb-0">
        {t(
          'The token address is {{address}}. Hit the add token button in your ERC20 wallet and enter this address.',
          {
            address: ADDRESSES.lockedAddress,
          }
        )}
      </p>
    </Callout>
  );
};
