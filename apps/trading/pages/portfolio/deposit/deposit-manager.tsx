import {
  DepositPage,
  DepositEvent_busEvents_event_Deposit,
} from '@vegaprotocol/graphql';
import { Dialog, EtherscanLink, Intent } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EthereumConfig } from '../../../components/web3-container/web3-container';
import { DepositForm } from './deposit-form';
import { useBalanceOfERC20Token } from './use-balance-of-erc20-token';
import { useDeposit } from './use-deposit';
import { TxState } from '../../../hooks/use-ethereum-transaction';
import sortBy from 'lodash/sortBy';
import { useApprove } from './use-approve';
import { useDepositLimits } from './use-deposit-limits';
import { useAllowance } from './use-allowance';

const activeClasses = 'text-black dark:text-white';

interface DepositManagerProps {
  ethereumConfig: EthereumConfig;
  data: DepositPage;
  initialAssetId?: string;
}

export const DepositManager = ({
  ethereumConfig,
  data,
  initialAssetId,
}: DepositManagerProps) => {
  const [assetId, setAssetId] = useState<string | undefined>(initialAssetId);

  const asset = useMemo(() => {
    const asset = data.assets?.find((a) => a.id === assetId);
    return asset;
  }, [data, assetId]);

  const balanceOf = useBalanceOfERC20Token(asset);
  console.log(balanceOf.toString());
  const limits = useDepositLimits(asset);
  const allowance = useAllowance(
    ethereumConfig.collateral_bridge_contract.address,
    asset
  );

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
        allowance={allowance}
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
  txHash: string | null;
}

export const ApproveDialog = ({
  status,
  error,
  confirmations,
  requiredConfirmations,
  txHash,
}: ApproveDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

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
    if (status !== TxState.Default && !dialogDismissed.current) {
      setDialogOpen(true);
    }
  }, [status]);

  const renderStatus = () => {
    if (status === TxState.Error) {
      return (
        <p className={activeClasses}>
          Something went wrong: {error && error.message}
        </p>
      );
    }

    return (
      <>
        <ConfirmRow status={status} />
        <TxRow
          status={status}
          txHash={txHash}
          confirmations={confirmations}
          requiredConfirmations={requiredConfirmations}
        />
      </>
    );
  };

  return (
    <Dialog
      title={
        status === TxState.Complete ? 'Approval complete' : 'Approval pending'
      }
      open={dialogOpen}
      onChange={(isOpen) => {
        setDialogOpen(isOpen);
        dialogDismissed.current = true;
      }}
      intent={getDialogIntent()}
    >
      <div className="text-ui text-black-40 dark:text-white-40">
        {renderStatus()}
      </div>
    </Dialog>
  );
};

interface DepositDialogProps {
  status: TxState;
  error: Error | null;
  confirmations: number;
  requiredConfirmations: number;
  txHash: string | null;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  useEffect(() => {
    if (status !== TxState.Default && !dialogDismissed.current) {
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

  const renderStatus = () => {
    if (status === TxState.Error) {
      return (
        <p className={activeClasses}>
          Something went wrong: {error && error.message}
        </p>
      );
    }

    return (
      <>
        <ConfirmRow status={status} />
        <TxRow
          status={status}
          txHash={txHash}
          confirmations={confirmations}
          requiredConfirmations={requiredConfirmations}
          highlightComplete={false}
        />
        <VegaRow status={status} finalizedDeposit={finalizedDeposit} />
      </>
    );
  };

  return (
    <Dialog
      title={finalizedDeposit ? 'Deposit complete' : 'Deposit pending'}
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={getDialogIntent()}
    >
      <div className="text-ui text-black-40 dark:text-white-40">
        {renderStatus()}
      </div>
    </Dialog>
  );
};

const ConfirmRow = ({ status }: { status: TxState }) => {
  if (status === TxState.Requested) {
    return (
      <p className="text-black dark:text-white">
        Confirm transaction in wallet
      </p>
    );
  }

  return <p>Confirmed in wallet</p>;
};

interface TxRowProps {
  status: TxState;
  txHash: string | null;
  confirmations: number;
  requiredConfirmations: number;
  highlightComplete?: boolean;
}

const TxRow = ({
  status,
  txHash,
  confirmations,
  requiredConfirmations,
  highlightComplete = true,
}: TxRowProps) => {
  const { chainId } = useWeb3React();

  if (status === TxState.Pending) {
    return (
      <p className={`flex justify-between ${activeClasses}`}>
        <span>
          Awaiting Ethereum transaction {confirmations}/{requiredConfirmations}{' '}
          confirmations...
        </span>
        <EtherscanLink
          tx={txHash || ''}
          chainId={chainId || 3}
          className="underline"
          text="View on Etherscan"
        />
      </p>
    );
  }

  if (status === TxState.Complete) {
    return (
      <p
        className={`flex justify-between ${
          highlightComplete ? activeClasses : ''
        }`}
      >
        <span>Ethereum transaction complete</span>
        <EtherscanLink
          tx={txHash || ''}
          chainId={chainId || 3}
          className="underline"
          text="View on Etherscan"
        />
      </p>
    );
  }

  return <p>Await Ethereum transaction</p>;
};

interface VegaRowProps {
  status: TxState;
  finalizedDeposit: DepositEvent_busEvents_event_Deposit | null;
}

const VegaRow = ({ status, finalizedDeposit }: VegaRowProps) => {
  if (status !== TxState.Complete) {
    return <p>Vega confirmation</p>;
  }

  if (!finalizedDeposit) {
    return (
      <p className="text-black dark:text-white">
        Vega is confirming your deposit...
      </p>
    );
  }

  return <p className="text-black dark:text-white">Deposit confirmed</p>;
};
