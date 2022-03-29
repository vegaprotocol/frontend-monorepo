import { DepositEvent_busEvents_event_Deposit } from '@vegaprotocol/graphql';
import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { TxState } from '../../../hooks/use-ethereum-transaction';

const ACTIVE_CLASSES = 'text-black dark:text-white';

export const ConfirmRow = ({ status }: { status: TxState }) => {
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

export const TxRow = ({
  status,
  txHash,
  confirmations,
  requiredConfirmations,
  highlightComplete = true,
}: TxRowProps) => {
  const { chainId } = useWeb3React();

  if (status === TxState.Pending) {
    return (
      <p className={`flex justify-between ${ACTIVE_CLASSES}`}>
        <span>
          Awaiting Ethereum transaction {confirmations}/{requiredConfirmations}{' '}
          confirmations...
        </span>
        <EtherscanLink
          tx={txHash || ''}
          chainId={chainId || 3}
          className="underline text-vega-pink dark:text-vega-yellow"
          text="View on Etherscan"
        />
      </p>
    );
  }

  if (status === TxState.Complete) {
    return (
      <p
        className={`flex justify-between ${
          highlightComplete ? ACTIVE_CLASSES : ''
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

export const VegaRow = ({ status, finalizedDeposit }: VegaRowProps) => {
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
