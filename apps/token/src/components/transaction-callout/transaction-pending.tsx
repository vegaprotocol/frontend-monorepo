import { Callout } from "@vegaprotocol/ui-toolkit";
import React from "react";
import { useTranslation } from "react-i18next";

import { EtherscanLink } from "../etherscan-link";
import { Loader } from "../loader";

export const TransactionPending = ({
  hash,
  heading,
  footer,
  body,
  confirmations,
  requiredConfirmations,
}: {
  hash: string;
  confirmations: number | null;
  requiredConfirmations: number | null;
  heading?: React.ReactElement | string;
  footer?: React.ReactElement | string;
  body?: React.ReactElement | string;
}) => {
  const { t } = useTranslation();
  const remainingConfirmations = React.useMemo(() => {
    if (requiredConfirmations) {
      return Math.max(0, requiredConfirmations - (confirmations || 0));
    }
    return 0;
  }, [confirmations, requiredConfirmations]);
  const title = React.useMemo(() => {
    const defaultTitle = heading || t("Transaction in progress");
    if (remainingConfirmations > 0) {
      return `${defaultTitle}. ${t("blockCountdown", {
        amount: remainingConfirmations,
      })}`;
    }
    return defaultTitle;
  }, [heading, remainingConfirmations, t]);
  return (
    <Callout icon={<Loader />} title={title}>
      {body && <p data-testid="transaction-pending-body">{body}</p>}
      <p>
        <EtherscanLink tx={hash} />
      </p>
      {footer && <p data-testid="transaction-pending-footer">{footer}</p>}
    </Callout>
  );
};
