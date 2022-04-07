import { gql, useQuery } from "@apollo/client";
import { Callout } from "@vegaprotocol/ui-toolkit";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AccountType } from "../../__generated__/globalTypes";
import { EthWalletContainer } from "../../components/eth-wallet-container";
import { Heading } from "../../components/heading";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { VegaWalletContainer } from "../../components/vega-wallet-container";
import { VegaKeyExtended } from "../../contexts/app-state/app-state-context";
import { Routes } from "../router-config";
import {
  WithdrawPage,
  WithdrawPageVariables,
} from "./__generated__/WithdrawPage";
import { WithdrawForm } from "./withdraw-form";

const Withdraw = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t("withdrawPageHeading")} />
      <p>{t("withdrawPageText")}</p>
      <VegaWalletContainer>
        {(currVegaKey) => <WithdrawContainer currVegaKey={currVegaKey} />}
      </VegaWalletContainer>
      <Callout title={t("withdrawPageInfoCalloutTitle")}>
        <p>{t("withdrawPageInfoCalloutText")}</p>
      </Callout>
    </>
  );
};

const WITHDRAW_PAGE_QUERY = gql`
  query WithdrawPage($partyId: ID!) {
    party(id: $partyId) {
      id
      accounts {
        balance
        balanceFormatted @client
        type
        asset {
          id
          name
          symbol
          decimals
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
      }
      withdrawals {
        id
        amount
        asset {
          id
          symbol
          decimals
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

interface WithdrawContainerProps {
  currVegaKey: VegaKeyExtended;
}

export const WithdrawContainer = ({ currVegaKey }: WithdrawContainerProps) => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<
    WithdrawPage,
    WithdrawPageVariables
  >(WITHDRAW_PAGE_QUERY, {
    variables: { partyId: currVegaKey?.pub! },
  });

  const accounts = React.useMemo(() => {
    if (!data?.party?.accounts) return [];
    // You can only withdraw from general accounts
    return data.party.accounts.filter((a) => a.type === AccountType.General);
  }, [data]);

  // Note there is a small period where the withdrawal might have a tx hash but is technically
  // not complete yet as the tx hash gets set before the transaction is confirmed
  const hasPendingWithdrawals = React.useMemo(() => {
    if (!data?.party?.withdrawals?.length) return false;
    return data.party.withdrawals.some((w) => w.txHash === null);
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

  return (
    <>
      {hasPendingWithdrawals && (
        <Callout title={t("pendingWithdrawalsCalloutTitle")} intent="action">
          <p>{t("pendingWithdrawalsCalloutText")}</p>
          <p>
            <Link to={Routes.WITHDRAWALS}>
              {t("pendingWithdrawalsCalloutButton")}
            </Link>
          </p>
        </Callout>
      )}
      <EthWalletContainer>
        {(connectedAddress) => (
          <WithdrawForm
            accounts={accounts}
            currVegaKey={currVegaKey}
            connectedAddress={connectedAddress}
          />
        )}
      </EthWalletContainer>
    </>
  );
};

export default Withdraw;
