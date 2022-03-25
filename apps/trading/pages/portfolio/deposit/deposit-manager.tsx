import {
  Deposit,
  DepositEvent_busEvents_event_Deposit,
} from '@vegaprotocol/graphql';
import { Dialog, EtherscanLink, Intent } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useState } from 'react';
import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useBalanceOfERC20Token } from './use-balance-of-erc20-token';
import { useDeposit } from './use-deposit';
import { TxState } from './use-ethereum-transaction';
import sortBy from 'lodash/sortBy';
import { useApprove } from './use-approve';
import { useDepositLimits } from './use-deposit-limits';

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
  const [assetId, setAssetId] = useState<string | null>(initialAssetId);

  const asset = useMemo(() => {
    const asset = data.assets.find((a) => a.id === assetId);
    return asset;
  }, [data, assetId]);

  const balanceOf = useBalanceOfERC20Token(asset);
  const limits = useDepositLimits(asset);

  const {
    perform: performApprove,
    status: statusApprove,
    confirmations: confirmationsApprove,
    txHash: txHashApprove,
    error: errorApprove,
  } = useApprove(ethereumConfig.collateral_bridge_contract.address, asset);

  const {
    perform: performDeposit,
    status: statusDeposit,
    confirmations: confirmationsDeposit,
    txHash: txHashDeposit,
    finalizedDeposit,
    error: errorDeposit,
  } = useDeposit(ethereumConfig);

  return (
    <>
      <DepositForm
        available={balanceOf}
        selectedAsset={asset}
        onSelectAsset={(id) => setAssetId(id)}
        assets={sortBy(data.assets, 'name')}
        submitApprove={performApprove}
        submitDeposit={performDeposit}
        limits={limits}
      />
      <ApproveDialog
        status={statusApprove}
        confirmations={confirmationsApprove}
        requiredConfirmations={1}
        txHash={txHashApprove}
        error={errorApprove}
      />
      <DepositDialog
        status={statusDeposit}
        finalizedDeposit={finalizedDeposit}
        txHash={txHashDeposit}
        confirmations={confirmationsDeposit}
        requiredConfirmations={ethereumConfig.confirmations}
        error={errorDeposit}
      />
    </>
  );
};

interface ApproveDialogProps {
  status: TxState;
  error: Error | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string;
}

export const ApproveDialog = ({
  status,
  error,
  confirmations,
  requiredConfirmations,
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

  const renderStatus = () => {
    if (status === TxState.Requested) {
      return <p>Confirm transaction in wallet...</p>;
    }

    if (status === TxState.Pending) {
      return (
        <>
          <p className="text-black-40">Confirmed in wallet</p>
          <p className="flex justify-between">
            <span>
              Awaiting Ethereum transaction {confirmations}/
              {requiredConfirmations} confirmations...
            </span>
            <EtherscanLink
              tx={txHash}
              chainId={chainId}
              className="underline"
              text="View on Etherscan"
            />
          </p>
        </>
      );
    }

    if (status === TxState.Error) {
      return <p>Something went wrong: {error && error.message}</p>;
    }

    if (status === TxState.Complete) {
      return (
        <>
          <p className="text-black-40">Confirmed in wallet</p>
          <p className="text-black-40 flex justify-between">
            <span>Ethereum transaction complete</span>
            <EtherscanLink
              tx={txHash}
              chainId={chainId}
              className="underline"
              text="View on Etherscan"
            />
          </p>
        </>
      );
    }
  };

  return (
    <Dialog
      title={
        status === TxState.Complete ? 'Approval complete' : 'Approval pending'
      }
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={getDialogIntent()}
    >
      <div className="text-ui">{renderStatus()}</div>
    </Dialog>
  );
};

interface DepositDialogProps {
  status: TxState;
  error: Error | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string;
  finalizedDeposit: DepositEvent_busEvents_event_Deposit | null;
}

export const DepositDialog = ({
  status,
  error,
  confirmations,
  requiredConfirmations,
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
  const getDialogIntent = () => {
    if (status === TxState.Requested) {
      return Intent.Prompt;
    }
    if (status === TxState.Error) {
      return Intent.Danger;
    }
    if (!finalizedDeposit) {
      return Intent.Progress;
    }
    if (finalizedDeposit) {
      return Intent.Success;
    }
  };
  const renderEthereumStatus = () => {
    if (status === TxState.Requested) {
      return <p>Confirm transaction in wallet...</p>;
    }

    if (status === TxState.Pending) {
      return (
        <>
          <p className="text-black-40">Confirmed in wallet</p>
          <p className="flex justify-between">
            <span>
              Awaiting Ethereum transaction {confirmations}/
              {requiredConfirmations} confirmations...
            </span>
            <EtherscanLink
              tx={txHash}
              chainId={chainId}
              className="underline"
              text="View on Etherscan"
            />
          </p>
        </>
      );
    }

    if (status === TxState.Error) {
      return <p>Something went wrong: {error && error.message}</p>;
    }

    if (status === TxState.Complete) {
      return (
        <>
          <p className="text-black-40">Confirmed in wallet</p>
          <p className="text-black-40 flex justify-between">
            <span>Ethereum transaction complete</span>
            <EtherscanLink
              tx={txHash}
              chainId={chainId}
              className="underline"
              text="View on Etherscan"
            />
          </p>
        </>
      );
    }
  };

  const renderVegaStatus = () => {
    if (status !== TxState.Complete) {
      return null;
    }

    if (!finalizedDeposit) {
      return <p>Vega is confirming your deposit...</p>;
    }

    return <p>Deposit confirmed</p>;
  };

  return (
    <Dialog
      title={finalizedDeposit ? 'Deposit complete' : 'Deposit pending'}
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={getDialogIntent()}
    >
      <div className="text-ui">
        {renderEthereumStatus()}
        {renderVegaStatus()}
      </div>
    </Dialog>
  );
};
