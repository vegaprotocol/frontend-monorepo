import { Callout } from "@vegaprotocol/ui-toolkit";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { EtherscanLink } from "../../components/etherscan-link";
import { Tick } from "../../components/icons";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";
import { Routes } from "../router-config";

export const Complete = ({
  address,
  balanceFormatted,
  commitTxHash,
  claimTxHash,
}: {
  address: string;
  balanceFormatted: BigNumber;
  commitTxHash: string | null;
  claimTxHash: string | null;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Callout intent="success" title="Claim complete" icon={<Tick />}>
        <p>
          <Trans
            i18nKey="claimCompleteMessage"
            values={{
              address,
              balance: formatNumber(balanceFormatted),
            }}
          />
        </p>
        {commitTxHash && (
          <p style={{ margin: 0 }}>
            {t("Link transaction")}:{" "}
            <EtherscanLink tx={commitTxHash} text={commitTxHash} />
          </p>
        )}
        {claimTxHash && (
          <p>
            {t("Claim transaction")}:{" "}
            <EtherscanLink tx={claimTxHash} text={claimTxHash} />
          </p>
        )}
        <Link to={Routes.VESTING}>
          <button className="fill">
            {t("Check your vesting VEGA tokens")}
          </button>
        </Link>
      </Callout>
    </>
  );
};
