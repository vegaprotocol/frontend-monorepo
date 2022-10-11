import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWeb3React } from '@web3-react/core';
import { EthConnectPrompt } from '../../../components/eth-connect-prompt';
import { DisassociatePage } from './disassociate-page';

export const DisassociateContainer = () => {
  const { account } = useWeb3React();
  const { pubKey } = useVegaWallet();

  if (!account) {
    return <EthConnectPrompt />;
  }

  return <DisassociatePage address={account} vegaKey={pubKey ?? ''} />;
};

export default DisassociateContainer;
