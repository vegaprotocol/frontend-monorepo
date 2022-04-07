import "./transaction-button.scss";

import { useTranslation } from "react-i18next";

import { TransactionState, TxState } from "../../hooks/transaction-reducer";
import { truncateMiddle } from "../../lib/truncate-middle";
import { EtherscanLink } from "../etherscan-link";
import { Error, HandUp, Tick } from "../icons";
import { Loader } from "../loader";
import { StatefulButton } from "../stateful-button";

interface TransactionButtonProps {
  text: string;
  transactionState: TransactionState;
  /** txHash of the transaction if already complete */
  forceTxHash: string | null;
  forceTxState?: TxState;
  disabled?: boolean;
  start: () => void;
  reset: () => void;
}

export const TransactionButton = ({
  text,
  transactionState,
  forceTxHash,
  forceTxState,
  disabled = false,
  start,
  reset,
}: TransactionButtonProps) => {
  const { t } = useTranslation();
  const { txState, txData } = transactionState;
  const root = "transaction-button";
  const wrapperClassName = `${root} transaction-button--${txState.toLowerCase()}`;
  const buttonClassName = `${root}__button fill`;
  const textClassName = `${root}__text`;
  const txHash = forceTxHash || txData.hash;
  const state = forceTxState || txState;

  if (state === TxState.Complete) {
    const className = `transaction-button transaction-button--${TxState.Complete.toLowerCase()}`;
    return (
      <div className={className}>
        <p className={textClassName}>
          <Tick />
          <span>{t("txButtonComplete")}</span>
        </p>
        <TransactionButtonFooter txHash={txHash} />
      </div>
    );
  }

  // User as started transaction and we are awaiting confirmation from the users wallet
  if (state === TxState.Requested) {
    return (
      <div className={wrapperClassName}>
        <StatefulButton className={buttonClassName} disabled={true}>
          <HandUp />
          <span>{t("txButtonActionRequired")}</span>
        </StatefulButton>
        <TransactionButtonFooter
          message={t("transactionHashPrompt")}
          txHash={txHash}
        />
      </div>
    );
  }

  if (state === TxState.Pending) {
    return (
      <div className={wrapperClassName}>
        <StatefulButton className={buttonClassName} disabled={true}>
          <Loader />
          <span>{t("txButtonAwaiting")}</span>
        </StatefulButton>
        <TransactionButtonFooter txHash={txHash} />
      </div>
    );
  }

  if (state === TxState.Error) {
    return (
      <div className={wrapperClassName}>
        <p className={textClassName}>
          <Error />
          <span>{t("txButtonFailure")}</span>
          <button onClick={reset} type="button" className="button-link">
            {t("Try again")}
          </button>
        </p>
        <TransactionButtonFooter txHash={txHash} />
      </div>
    );
  }

  // Idle
  return (
    <div className={wrapperClassName}>
      <StatefulButton
        className={buttonClassName}
        onClick={start}
        disabled={disabled}
      >
        {text}
      </StatefulButton>
      <TransactionButtonFooter txHash={txHash} />
    </div>
  );
};

interface TransactionButtonFooterProps {
  txHash: string | null;
  message?: string;
}

export const TransactionButtonFooter = ({
  txHash,
  message,
}: TransactionButtonFooterProps) => {
  const { t } = useTranslation();

  if (message) {
    return (
      <div className="transaction-button__footer">
        <p className="transaction-button__message">
          <Error />
          {message}
        </p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="transaction-button__footer">
        <p className="transaction-button__txhash">
          <span>{t("transaction")}</span>
          <EtherscanLink text={truncateMiddle(txHash)} tx={txHash} />
        </p>
      </div>
    );
  }

  return null;
};
