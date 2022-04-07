import "./vega-wallet.scss";

import * as Sentry from "@sentry/react";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  AppStateActionType,
  useAppState,
  VegaKeyExtended,
} from "../../contexts/app-state/app-state-context";
import { useRefreshAssociatedBalances } from "../../hooks/use-refresh-associated-balances";
import { useVegaUser } from "../../hooks/use-vega-user";
import vegaWhite from "../../images/vega_white.png";
import { BigNumber } from "../../lib/bignumber";
import { truncateMiddle } from "../../lib/truncate-middle";
import { vegaWalletService } from "../../lib/vega-wallet/vega-wallet-service";
import { Routes } from "../../routes/router-config";
import { BulletHeader } from "../bullet-header";
import {
  WalletCard,
  WalletCardActions,
  WalletCardAsset,
  WalletCardAssetProps,
  WalletCardContent,
  WalletCardHeader,
  WalletCardRow,
} from "../wallet-card";
import { DownloadWalletPrompt } from "./download-wallet-prompt";
import { usePollForDelegations } from "./hooks";

export const VegaWallet = () => {
  const { t } = useTranslation();
  const { currVegaKey, vegaKeys } = useVegaUser();

  const child = !vegaKeys ? (
    <VegaWalletNotConnected />
  ) : (
    <VegaWalletConnected currVegaKey={currVegaKey} vegaKeys={vegaKeys} />
  );

  return (
    <section className="vega-wallet">
      <WalletCard dark={true}>
        <WalletCardHeader dark={true}>
          <div>
            <h1>{t("vegaWallet")}</h1>
            <span style={{ marginLeft: 8, marginRight: 8 }}>
              {currVegaKey && `(${currVegaKey.alias})`}
            </span>
          </div>
          {currVegaKey && (
            <span className="vega-wallet__curr-key">
              {currVegaKey.pubShort}
            </span>
          )}
        </WalletCardHeader>
        <WalletCardContent>{child}</WalletCardContent>
      </WalletCard>
    </section>
  );
};

const VegaWalletNotConnected = () => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();

  return (
    <>
      <button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
            isOpen: true,
          })
        }
        className="fill button-secondary"
        data-testid="connect-vega"
        type="button"
      >
        {t("connectVegaWalletToUseAssociated")}
      </button>
      <DownloadWalletPrompt />
    </>
  );
};

interface VegaWalletAssetsListProps {
  accounts: WalletCardAssetProps[];
}

const VegaWalletAssetList = ({ accounts }: VegaWalletAssetsListProps) => {
  const { t } = useTranslation();
  if (!accounts.length) {
    return null;
  }
  return (
    <>
      <WalletCardHeader>
        <BulletHeader style={{ border: "none" }} tag="h2">
          {t("assets")}
        </BulletHeader>
      </WalletCardHeader>
      {accounts.map((a, i) => (
        <WalletCardAsset key={i} {...a} dark={true} />
      ))}
    </>
  );
};

interface VegaWalletConnectedProps {
  currVegaKey: VegaKeyExtended | null;
  vegaKeys: VegaKeyExtended[];
}

const VegaWalletConnected = ({
  currVegaKey,
  vegaKeys,
}: VegaWalletConnectedProps) => {
  const { t } = useTranslation();
  const { account } = useWeb3React();
  const {
    appDispatch,
    appState: { decimals },
  } = useAppState();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const { delegations, currentStakeAvailable, delegatedNodes, accounts } =
    usePollForDelegations();

  const handleDisconnect = React.useCallback(
    async function () {
      try {
        setDisconnecting(true);
        await vegaWalletService.revokeToken();
        appDispatch({ type: AppStateActionType.VEGA_WALLET_DISCONNECT });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    [appDispatch]
  );

  const unstaked = React.useMemo(() => {
    const totalDelegated = delegations.reduce<BigNumber>(
      (acc, cur) => acc.plus(cur.amountFormatted),
      new BigNumber(0)
    );
    return BigNumber.max(currentStakeAvailable.minus(totalDelegated), 0);
  }, [currentStakeAvailable, delegations]);

  const changeKey = React.useCallback(
    async (k: VegaKeyExtended) => {
      if (account) {
        await setAssociatedBalances(account, k.pub);
      }
      vegaWalletService.setKey(k.pub);
      appDispatch({
        type: AppStateActionType.VEGA_WALLET_SET_KEY,
        key: k,
      });
      setExpanded(false);
    },
    [account, appDispatch, setAssociatedBalances]
  );

  const footer = (
    <WalletCardActions>
      {vegaKeys.length > 1 ? (
        <button
          className="button-link"
          onClick={() => setExpanded((x) => !x)}
          type="button"
        >
          {expanded ? "Hide keys" : "Change key"}
        </button>
      ) : null}
      <button className="button-link" onClick={handleDisconnect} type="button">
        {disconnecting ? t("awaitingDisconnect") : t("disconnect")}
      </button>
    </WalletCardActions>
  );

  return vegaKeys.length ? (
    <>
      <WalletCardAsset
        image={vegaWhite}
        decimals={decimals}
        name="VEGA"
        subheading={t("Associated")}
        symbol="VEGA"
        balance={currentStakeAvailable}
        dark={true}
      />
      <WalletCardRow label={t("unstaked")} value={unstaked} dark={true} />
      {delegatedNodes.length ? (
        <WalletCardRow label={t("stakedValidators")} dark={true} bold={true} />
      ) : null}
      {delegatedNodes.map((d) => (
        <div key={d.nodeId}>
          {d.currentEpochStake && d.currentEpochStake.isGreaterThan(0) && (
            <WalletCardRow
              label={`${d.name || truncateMiddle(d.nodeId)} ${
                d.hasStakePending ? `(${t("thisEpoch")})` : ""
              }`}
              link={`${Routes.STAKING}/${d.nodeId}`}
              value={d.currentEpochStake}
              dark={true}
            />
          )}
          {d.hasStakePending && (
            <WalletCardRow
              label={`${d.name || truncateMiddle(d.nodeId)} (${t(
                "nextEpoch"
              )})`}
              link={`${Routes.STAKING}/${d.nodeId}`}
              value={d.nextEpochStake}
              dark={true}
            />
          )}
        </div>
      ))}
      <WalletCardActions>
        <Link style={{ flex: 1 }} to={Routes.GOVERNANCE}>
          <button className="button-secondary">{t("governance")}</button>
        </Link>
        <Link style={{ flex: 1 }} to={Routes.STAKING}>
          <button className="button-secondary">{t("staking")}</button>
        </Link>
      </WalletCardActions>
      <VegaWalletAssetList accounts={accounts} />
      {expanded && (
        <ul className="vega-wallet__key-list">
          {vegaKeys
            .filter((k) => currVegaKey && currVegaKey.pub !== k.pub)
            .map((k) => (
              <li key={k.pub} onClick={() => changeKey(k)}>
                {k.alias} {k.pubShort}
              </li>
            ))}
        </ul>
      )}
      {footer}
    </>
  ) : (
    <WalletCardContent>{t("noKeys")}</WalletCardContent>
  );
};
