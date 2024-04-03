import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useWeb3React } from '@web3-react/core';
import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import { DisassociatePage } from './components/disassociate-page';
import { Heading } from '../../../components/heading';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import type { RouteChildProps } from '../../index';

export const DisassociateContainer = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();

  return (
    <>
      <Heading title={t('pageTitleDisassociate')} />
      {!account ? (
        <>
          <p className="mb-8">{t('DisassociateVegaTokensFromWallet')}</p>
          <div className="max-w-[400px]">
            <EthConnectPrompt />
          </div>
        </>
      ) : (
        <DisassociatePage address={account} vegaKey={pubKey ?? ''} />
      )}
    </>
  );
};

export default DisassociateContainer;
