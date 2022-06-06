import { useTranslation } from 'react-i18next';

import { useAddAssetSupported } from '../../hooks/use-add-asset-to-wallet';
import vegaVesting from '../../images/vega_vesting.png';
import { AddTokenButtonLink } from '../add-token-button/add-token-button';
import { Callout } from '@vegaprotocol/ui-toolkit';
import { EnvironmentConfig } from '@vegaprotocol/smart-contracts';
import type { Networks } from '@vegaprotocol/react-helpers';

const LOCKED_ADDRESS =
  EnvironmentConfig[process.env['NX_VEGA_ENV'] as Networks].lockedAddress;

export const AddLockedTokenAddress = () => {
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
              address={LOCKED_ADDRESS}
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
            address: LOCKED_ADDRESS,
          }
        )}
      </p>
    </Callout>
  );
};
