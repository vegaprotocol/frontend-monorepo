import "./index.scss";

import { useQuery } from "@apollo/client";
import { Callout } from "@vegaprotocol/ui-toolkit";
import { formatDistance } from "date-fns";
// @ts-ignore
import Duration from "duration-js";
import gql from "graphql-tag";
import React from "react";
import { useTranslation } from "react-i18next";

import { EpochCountdown } from "../../../components/epoch-countdown";
import { Heading } from "../../../components/heading";
import { SplashLoader } from "../../../components/splash-loader";
import { SplashScreen } from "../../../components/splash-screen";
import { NetworkParams } from "../../../config";
import {
  AppStateActionType,
  useAppState,
} from "../../../contexts/app-state/app-state-context";
import { useNetworkParam } from "../../../hooks/use-network-param";
import { useVegaUser } from "../../../hooks/use-vega-user";
import { Rewards } from "./__generated__/Rewards";
import { RewardInfo } from "./reward-info";

export const REWARDS_QUERY = gql`
  query Rewards($partyId: ID!) {
    party(id: $partyId) {
      id
      rewardDetails {
        asset {
          id
          symbol
        }
        rewards {
          asset {
            id
          }
          party {
            id
          }
          epoch {
            id
          }
          amount
          amountFormatted @client
          percentageOfTotal
          receivedAt
        }
        totalAmount
        totalAmountFormatted @client
      }
      delegations {
        amount
        amountFormatted @client
        epoch
      }
    }
    epoch {
      id
      timestamps {
        start
        end
        expiry
      }
    }
  }
`;

export const RewardsIndex = () => {
  const { t } = useTranslation();
  const { currVegaKey, vegaKeys } = useVegaUser();
  const { appDispatch } = useAppState();
  const { data, loading, error } = useQuery<Rewards>(REWARDS_QUERY, {
    variables: { partyId: currVegaKey?.pub },
    skip: !currVegaKey?.pub,
  });
  const {
    data: rewardAssetData,
    loading: rewardAssetLoading,
    error: rewardAssetError,
  } = useNetworkParam([
    NetworkParams.REWARD_ASSET,
    NetworkParams.REWARD_PAYOUT_DURATION,
  ]);

  const payoutDuration = React.useMemo(() => {
    if (!rewardAssetData || !rewardAssetData[1]) {
      return 0;
    }
    return new Duration(rewardAssetData[1]).milliseconds();
  }, [rewardAssetData]);

  if (error || rewardAssetError) {
    return (
      <section>
        <p>{t("Something went wrong")}</p>
        {error && <pre>{error.message}</pre>}
        {rewardAssetError && <pre>{rewardAssetError.message}</pre>}
      </section>
    );
  }

  if (loading || rewardAssetLoading || !rewardAssetData?.length) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return (
    <section className="rewards">
      <Heading title={t("pageTitleRewards")} />
      <p>{t("rewardsPara1")}</p>
      <p>{t("rewardsPara2")}</p>
      {payoutDuration ? (
        <Callout
          title={t("rewardsCallout", {
            duration: formatDistance(new Date(0), payoutDuration),
          })}
          intent="warn"
        >
          <p>{t("rewardsPara3")}</p>
        </Callout>
      ) : null}
      {!loading &&
        data &&
        !error &&
        data.epoch.timestamps.start &&
        data.epoch.timestamps.expiry && (
          <EpochCountdown
            containerClass="staking-node__epoch"
            id={data!.epoch.id}
            startDate={new Date(data.epoch.timestamps.start)}
            endDate={new Date(data.epoch.timestamps.expiry!)}
          />
        )}
      <section>
        {currVegaKey && vegaKeys?.length ? (
          <RewardInfo
            currVegaKey={currVegaKey}
            data={data}
            rewardAssetId={rewardAssetData[0]}
          />
        ) : (
          <button
            className="fill"
            onClick={() =>
              appDispatch({
                type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
                isOpen: true,
              })
            }
          >
            {t("connectVegaWallet")}
          </button>
        )}
      </section>
    </section>
  );
};
