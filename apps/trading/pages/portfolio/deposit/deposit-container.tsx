import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useWeb3React } from '@web3-react/core';
import { gql } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from './token-abi.json';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { Deposit, Deposit_assets } from '@vegaprotocol/graphql';

BigNumber.config({ EXPONENTIAL_AT: 20000 });

const DEPOSIT_QUERY = gql`
  query Deposit {
    assets {
      id
      symbol
      name
      decimals
      source {
        ... on ERC20 {
          contractAddress
        }
      }
    }
  }
`;

interface DepositContainerProps {
  ethereumConfig: EthereumConfig;
  assetId?: string;
}

export const DepositContainer = ({
  ethereumConfig,
  assetId,
}: DepositContainerProps) => {
  return (
    <PageQueryContainer<Deposit> query={DEPOSIT_QUERY}>
      {(data) => <DepositManager data={data} initialAssetId={assetId} />}
    </PageQueryContainer>
  );
};

interface DepositManagerProps {
  data: Deposit;
  initialAssetId?: string;
}

export const DepositManager = ({
  data,
  initialAssetId = null,
}: DepositManagerProps) => {
  const [assetId, setAssetId] = useState<string | null>(initialAssetId);

  const asset = useMemo(() => {
    const asset = data.assets.find((a) => a.id === assetId);
    return asset;
  }, [data, assetId]);

  const balanceOf = useBalanceOfERC20Token(asset);

  return (
    <DepositForm
      available={balanceOf}
      selectedAsset={asset}
      onSelectAsset={(id) => setAssetId(id)}
      assets={data.assets}
    />
  );
};

const useBalanceOfERC20Token = (asset?: Deposit_assets) => {
  const { account, provider } = useWeb3React();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balanceOf, setBalanceOf] = useState(new BigNumber(0));

  useEffect(() => {
    if (asset && asset.source.__typename === 'ERC20' && provider) {
      setContract(
        new ethers.Contract(asset.source.contractAddress, TOKEN_ABI, provider)
      );
    }
  }, [asset, provider]);

  useEffect(() => {
    const getBalance = async () => {
      if (!contract || !account) {
        return;
      }

      const res = await contract.balanceOf(account);
      setBalanceOf(new BigNumber(addDecimal(res.toString(), asset.decimals)));
    };

    getBalance();
  }, [contract, account, asset]);

  return balanceOf;
};
