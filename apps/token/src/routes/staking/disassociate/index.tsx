import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import { DisassociatePage } from './components/disassociate-page';
import { Heading } from '../../../components/heading';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const DisassociateContainer = () => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();

  return (
    <>
      <Heading title={t('pageTitleDisassociate')} />
      {!account ? (
        <EthConnectPrompt />
      ) : (
        <DisassociatePage address={account} vegaKey={pubKey ?? ''} />
      )}
    </>
  );
};

export default DisassociateContainer;
