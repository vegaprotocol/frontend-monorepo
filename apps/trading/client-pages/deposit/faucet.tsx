import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { Token } from '@vegaprotocol/smart-contracts';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import { EthTxStatus, useEthTransactionStore } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';

export const Faucet = ({
  asset,
  refetchBalances,
}: {
  asset: AssetFieldsFragment;
  refetchBalances: () => void;
}) => {
  const { provider } = useWeb3React();

  const [id, setId] = useState<number | null>(null);
  const send = useEthTransactionStore((store) => store.create);
  const tx = useEthTransactionStore((store) => {
    return store.transactions.find((t) => t?.id == id);
  });

  const submitFaucet = async () => {
    if (!provider) throw new Error('no provider');
    if (!isAssetTypeERC20(asset)) {
      throw new Error('no asset selected');
    }
    const signer = provider.getSigner();
    const contract = new Token(
      asset.source.contractAddress,
      signer || provider
    );
    const id = send(contract, 'faucet', []);
    setId(id);
  };

  useEffect(() => {
    if (tx?.status === EthTxStatus.Confirmed) {
      refetchBalances();
    }
  }, [tx?.status, refetchBalances]);

  if (tx && tx.status === EthTxStatus.Pending) {
    return (
      <TradingButton size="small" disabled={true}>
        {t('Fauceting...')}
      </TradingButton>
    );
  }

  return (
    <TradingButton size="small" onClick={submitFaucet}>
      <span className="whitespace-nowrap">{t('Faucet')}</span>
    </TradingButton>
  );
};
