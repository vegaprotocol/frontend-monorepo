import { useTranslation } from 'react-i18next';
import { Callout, Intent, Link } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useEnvironment, DocsLinks } from '@vegaprotocol/environment';
import type { EthereumConfig } from '@vegaprotocol/web3';

export const MultisigIncorrectNotice = () => {
  const { t } = useTranslation();
  const { config } = useEthereumConfig();
  const { ETHERSCAN_URL } = useEnvironment();

  if (!config) {
    return null;
  }

  const contract = config[
    'multisig_control_contract' as keyof EthereumConfig
  ] as {
    address: string;
  };

  return (
    <div className="mb-10">
      <Callout intent={Intent.Warning}>
        <div>
          <Link
            title={contract.address}
            href={`${ETHERSCAN_URL}/address/${contract.address}`}
            target="_blank"
            data-testid="multisig-contract-link"
          >
            {t('multisigContractLink')}
          </Link>{' '}
          {t('multisigContractIncorrect')}
        </div>

        <div className="mt-2">
          <Link
            href={DocsLinks?.VALIDATOR_SCORES_REWARDS}
            target="_blank"
            data-testid="multisig-validators-learn-more"
          >
            {t('learnMore')}
          </Link>
        </div>
      </Callout>
    </div>
  );
};
