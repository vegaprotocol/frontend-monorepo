import "./withdrawals.scss";

import { gql, useQuery } from "@apollo/client";
import { Callout } from "@vegaprotocol/ui-toolkit";
import { useWeb3React } from "@web3-react/core";
import { format } from "date-fns";
import orderBy from "lodash/orderBy";
import React from "react";
import { useTranslation } from "react-i18next";

import { EtherscanLink } from "../../components/etherscan-link";
import { CopyToClipboardType } from "../../components/etherscan-link/etherscan-link";
import { Heading } from "../../components/heading";
import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../components/key-value-table";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { TransactionButton } from "../../components/transaction-button";
import { VegaWalletContainer } from "../../components/vega-wallet-container";
import { VegaKeyExtended } from "../../contexts/app-state/app-state-context";
import { useContracts } from "../../contexts/contracts/contracts-context";
import { TxState } from "../../hooks/transaction-reducer";
import { usePollERC20Approval } from "../../hooks/use-ercPoll20Approval";
import { useRefreshBalances } from "../../hooks/use-refresh-balances";
import { useTransaction } from "../../hooks/use-transaction";
import { BigNumber } from "../../lib/bignumber";
import { DATE_FORMAT_DETAILED } from "../../lib/date-formats";
import { addDecimal } from "../../lib/decimals";
import { truncateMiddle } from "../../lib/truncate-middle";
import {
  WithdrawalsPage,
  WithdrawalsPage_party_withdrawals,
  WithdrawalsPageVariables,
} from "./__generated__/WithdrawalsPage";

const Withdrawals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t("withdrawalsTitle")} />
      <p>{t("withdrawalsText")}</p>
      <Callout title={t("withdrawalsPreparedWarningHeading")} intent="warn">
        <p>{t("withdrawalsPreparedWarningText")}</p>
      </Callout>
      <VegaWalletContainer>
        {(currVegaKey) => (
          <WithdrawPendingContainer currVegaKey={currVegaKey} />
        )}
      </VegaWalletContainer>
    </>
  );
};

interface WithdrawPendingContainerProps {
  currVegaKey: VegaKeyExtended;
}

const WITHDRAWALS_PAGE_QUERY = gql`
  query WithdrawalsPage($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        id
        amount
        asset {
          id
          symbol
          decimals
        }
        party {
          id
        }
        status
        createdTimestamp
        withdrawnTimestamp
        txHash
        details {
          ... on Erc20WithdrawalDetails {
            receiverAddress
          }
        }
      }
    }
  }
`;

const WithdrawPendingContainer = ({
  currVegaKey,
}: WithdrawPendingContainerProps) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const refreshBalances = useRefreshBalances(account || "");
  const { data, loading, error, refetch } = useQuery<
    WithdrawalsPage,
    WithdrawalsPageVariables
  >(WITHDRAWALS_PAGE_QUERY, {
    variables: { partyId: currVegaKey.pub },
    // This must be network-only because you are navigated to this page automatically after the withdrawal is created,
    // if you have already visited this page the query result is cached with 0 withdrawals, so we need to refetch every
    // time to ensure the withdrawal is shown immediately
    fetchPolicy: "network-only",
  });

  const withdrawals = React.useMemo(() => {
    if (!data?.party?.withdrawals?.length) return [];

    return orderBy(
      data.party.withdrawals,
      [(w) => new Date(w.createdTimestamp)],
      ["desc"]
    );
  }, [data]);

  if (error) {
    return (
      <section>
        <p>{t("Something went wrong")}</p>
        {error && <pre>{error.message}</pre>}
      </section>
    );
  }

  if (loading || !data) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  if (!withdrawals.length) {
    return <p>{t("withdrawalsNone")}</p>;
  }

  return (
    <ul className="withdrawals-list">
      {withdrawals.map((w) => (
        <li key={w.id}>
          <Withdrawal
            withdrawal={w}
            refetchWithdrawals={refetch}
            refetchBalances={refreshBalances}
          />
        </li>
      ))}
    </ul>
  );
};

interface WithdrawalProps {
  withdrawal: WithdrawalsPage_party_withdrawals;
  refetchWithdrawals: () => void;
  refetchBalances: () => void;
}

export const Withdrawal = ({
  withdrawal,
  refetchWithdrawals,
  refetchBalances,
}: WithdrawalProps) => {
  const { t } = useTranslation();
  const erc20Approval = usePollERC20Approval(withdrawal.id);
  const { erc20Bridge } = useContracts();
  const { state, perform, reset } = useTransaction(() => {
    if (!erc20Approval) {
      throw new Error("Withdraw needs approval object");
    }
    if (!withdrawal.details?.receiverAddress) {
      throw new Error("Missing receiver address");
    }

    return erc20Bridge.withdraw({
      assetSource: erc20Approval.assetSource,
      amount: erc20Approval.amount,
      nonce: erc20Approval.nonce,
      signatures: erc20Approval.signatures,
      // TODO: switch when targetAddress is populated and deployed to mainnet data.erc20WithdrawalApproval.targetAddress,
      targetAddress: withdrawal.details.receiverAddress,
    });
  });

  React.useEffect(() => {
    // Once complete we need to refetch the withdrawals so that pending withdrawal
    // is updated to have a txHash indicating it is complete. Updating your account balance
    // is already handled by the query in the VegaWallet that polls
    if (state.txState === TxState.Complete) {
      refetchWithdrawals();
      refetchBalances();
    }
  }, [state, refetchWithdrawals, refetchBalances]);

  return (
    <div>
      <KeyValueTable>
        <KeyValueTableRow>
          <th>{t("Withdraw")}</th>
          <td>
            {addDecimal(
              new BigNumber(withdrawal.amount),
              withdrawal.asset.decimals
            )}{" "}
            {withdrawal.asset.symbol}
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("from")}</th>
          <td>{truncateMiddle(withdrawal.party.id)}</td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("toEthereum")}</th>
          <td>
            <EtherscanLink
              address={withdrawal.details?.receiverAddress as string}
              text={truncateMiddle(
                withdrawal.details?.receiverAddress as string
              )}
              copyToClipboard={CopyToClipboardType.LINK}
            />
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("created")}</th>
          <td>
            {format(
              new Date(withdrawal.createdTimestamp),
              DATE_FORMAT_DETAILED
            )}
          </td>
        </KeyValueTableRow>
        <KeyValueTableRow>
          <th>{t("Signature")}</th>
          <td title={erc20Approval?.signatures}>
            {!erc20Approval?.signatures
              ? t("Loading")
              : truncateMiddle(erc20Approval.signatures)}
          </td>
        </KeyValueTableRow>
      </KeyValueTable>
      <TransactionButton
        text={
          !erc20Approval
            ? t("withdrawalsPreparingButton")
            : t("withdrawalsCompleteButton")
        }
        transactionState={state}
        forceTxState={withdrawal.txHash ? TxState.Complete : undefined}
        forceTxHash={withdrawal.txHash}
        disabled={!erc20Approval}
        start={perform}
        reset={reset}
      />
    </div>
  );
};

export default Withdrawals;
