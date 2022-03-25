import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useWeb3React } from '@web3-react/core';
import { gql, useSubscription } from '@apollo/client';
import { PageQueryContainer } from '../../../components/page-query-container';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import BRIDGE_ABI from './bridge-abi.json';
import BigNumber from 'bignumber.js';
import {
  Deposit,
  Deposit_assets,
  DepositEvent,
  DepositEventVariables,
  DepositEvent_busEvents_event_Deposit,
} from '@vegaprotocol/graphql';
import { Dialog, EtherscanLink, Intent } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { ERC20Token, VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';

export enum TxState {
  Default = 'Default',
  Requested = 'Requested',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

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
      {(data) => (
        <DepositManager
          ethereumConfig={ethereumConfig}
          data={data}
          initialAssetId={assetId}
        />
      )}
    </PageQueryContainer>
  );
};

interface DepositManagerProps {
  ethereumConfig: EthereumConfig;
  data: Deposit;
  initialAssetId?: string;
}

export const DepositManager = ({
  ethereumConfig,
  data,
  initialAssetId = null,
}: DepositManagerProps) => {
  const { provider } = useWeb3React();
  const [assetId, setAssetId] = useState<string | null>(initialAssetId);

  const asset = useMemo(() => {
    const asset = data.assets.find((a) => a.id === assetId);
    return asset;
  }, [data, assetId]);

  const tokenContract = useMemo(() => {
    if (!asset || asset.source.__typename !== 'ERC20') {
      return null;
    }

    return new ERC20Token(
      asset.source.contractAddress,
      provider,
      provider.getSigner()
    );
  }, [asset, provider]);

  const balanceOf = useBalanceOfERC20Token(tokenContract, asset);

  const {
    perform: performApprove,
    status: statusApprove,
    confirmations: confirmationsApprove,
    txHash: txHashApprove,
  } = useEthereumTransaction(() =>
    tokenContract.approve(ethereumConfig.collateral_bridge_contract.address)
  );

  const {
    perform: performDeposit,
    status: statusDeposit,
    confirmations: confirmationsDeposit,
    txHash: txHashDeposit,
    finalizedDeposit,
  } = useDeposit(ethereumConfig);

  return (
    <>
      <DepositForm
        available={balanceOf}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={data.assets}
        submitApprove={performApprove}
        submitDeposit={performDeposit}
      />
      <ApproveDialog
        status={statusApprove}
        confirmations={confirmationsApprove}
        txHash={txHashApprove}
      />
      <DepositDialog
        status={statusDeposit}
        finalizedDeposit={finalizedDeposit}
        txHash={txHashDeposit}
        confirmations={confirmationsDeposit}
      />
    </>
  );
};

const useBalanceOfERC20Token = (
  contract: ERC20Token,
  asset?: Deposit_assets
) => {
  const { account } = useWeb3React();
  const [balanceOf, setBalanceOf] = useState(new BigNumber(0));

  useEffect(() => {
    const getBalance = async () => {
      if (!contract || !account || !asset) {
        return;
      }

      const res = await contract.balanceOf(account);
      console.log(res.toString());
      setBalanceOf(res);
    };

    getBalance();
  }, [contract, account, asset]);

  return balanceOf;
};

export const useEthereumTransaction = (
  // eslint-disable-next-line
  func: (...args: any) => Promise<ethers.ContractTransaction>,
  requiredConfirmations = 1
) => {
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState(TxState.Default);
  const [txHash, setTxHash] = useState<string | null>(null);

  const perform = useCallback(
    // eslint-disable-next-line
    async (...args: any) => {
      setConfirmations(0);
      setStatus(TxState.Requested);

      try {
        const tx: ethers.ContractTransaction = await func(...args);
        let receipt: ethers.ContractReceipt | null = null;

        setTxHash(tx.hash);
        setStatus(TxState.Pending);

        for (let i = 1; i <= requiredConfirmations; i++) {
          receipt = await tx.wait(i);
          setConfirmations(receipt.confirmations);
        }

        if (!receipt) {
          throw new Error('No receipt after confirmations are met');
        }

        console.log(receipt);
        setStatus(TxState.Complete);
      } catch (err) {
        console.error(err);
        setStatus(TxState.Error);
      }
    },
    [func, requiredConfirmations]
  );

  return { perform, status, confirmations, txHash };
};

interface ApproveDialogProps {
  status: TxState;
  confirmations: number;
  txHash: string;
}

export const ApproveDialog = ({
  status,
  confirmations,
  txHash,
}: ApproveDialogProps) => {
  const { chainId } = useWeb3React();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getDialogIntent = () => {
    if (status === TxState.Requested) {
      return Intent.Prompt;
    }
    if (status === TxState.Pending) {
      return Intent.Progress;
    }
    if (status === TxState.Error) {
      return Intent.Danger;
    }
    if (status === TxState.Complete) {
      return Intent.Success;
    }
  };

  useEffect(() => {
    if (status !== TxState.Default) {
      setDialogOpen(true);
    }
  }, [status]);

  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={getDialogIntent()}
    >
      <div>
        <p>Transaction status: {status}</p>
        <p>Confirmations: {confirmations}</p>
        <p>
          <EtherscanLink tx={txHash} chainId={chainId} />
        </p>
      </div>
    </Dialog>
  );
};

interface DepositDialogProps {
  status: TxState;
  confirmations: number;
  txHash: string;
  finalizedDeposit: DepositEvent_busEvents_event_Deposit | null;
}

export const DepositDialog = ({
  status,
  confirmations,
  txHash,
  finalizedDeposit,
}: DepositDialogProps) => {
  const { chainId } = useWeb3React();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status !== TxState.Default) {
      setDialogOpen(true);
    }
  }, [status]);

  return (
    <Dialog
      title={
        finalizedDeposit ? 'Deposit complete' : `Deposit pending: ${status}`
      }
      open={dialogOpen}
      onChange={setDialogOpen}
    >
      <div>
        <p>Transaction status: {status}</p>
        <p>Confirmations: {confirmations}</p>
        <p>
          <EtherscanLink tx={txHash} chainId={chainId} />
        </p>
      </div>
    </Dialog>
  );
};

const DEPOSIT_EVENT_SUB = gql`
  subscription DepositEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
      eventId
      block
      type
      event {
        ... on Deposit {
          id
          txHash
        }
      }
    }
  }
`;

const useDeposit = (ethereumConfig: EthereumConfig) => {
  const { keypair } = useVegaWallet();
  const { provider } = useWeb3React();

  const bridgeContract = useMemo(() => {
    // @ts-ignore Networks as TESTNET
    return new VegaErc20Bridge('TESTNET', provider, provider.getSigner());
  }, [provider]);

  console.log(bridgeContract);

  const { perform, status, confirmations, txHash } = useEthereumTransaction(
    (...args) => {
      // @ts-ignore get around args typing
      return bridgeContract.depositAsset(...args);
    },
    ethereumConfig.confirmations
  );
  const [finalizedDeposit, setFinalizedDeposit] =
    useState<DepositEvent_busEvents_event_Deposit>(null);

  useSubscription<DepositEvent, DepositEventVariables>(DEPOSIT_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data.busEvents.length) {
        return;
      }

      const matchingDeposit = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Deposit') {
          return false;
        }

        if (e.event.txHash === txHash) {
          return true;
        }

        return false;
      });

      if (matchingDeposit && matchingDeposit.event.__typename === 'Deposit') {
        setFinalizedDeposit(matchingDeposit.event);
      }
    },
  });

  return {
    perform,
    status,
    confirmations,
    txHash,
    finalizedDeposit,
  };
};
