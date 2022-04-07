import { IClaimTokenParams } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";
import { useTranslation } from "react-i18next";

import { BulletHeader } from "../../../components/bullet-header";
import { CountrySelector } from "../../../components/country-selector";
import { FormGroup } from "../../../components/form-group";
import { useContracts } from "../../../contexts/contracts/contracts-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useTransaction } from "../../../hooks/use-transaction";
import {
  ClaimAction,
  ClaimActionType,
  ClaimState,
  ClaimStatus,
} from "../claim-reducer";
import { ClaimStep1 } from "../claim-step-1";
import { ClaimStep2 } from "../claim-step-2";
import { useClaim } from "../hooks";

interface UntargetedClaimProps {
  address: string;
  claimData: IClaimTokenParams;
  state: ClaimState;
  committed: boolean;
  dispatch: React.Dispatch<ClaimAction>;
}

export const UntargetedClaim = ({
  address,
  committed,
  claimData,
  state,
  dispatch,
}: UntargetedClaimProps) => {
  const { claim } = useContracts();
  const {
    state: commitState,
    dispatch: commitDispatch,
    perform: commitClaim,
  } = useTransaction(() => claim.commit(claimData.signature.s));
  const {
    state: revealState,
    dispatch: revealDispatch,
    perform: commitReveal,
  } = useClaim(claimData, address);
  const { t } = useTranslation();
  React.useEffect(() => {
    if (commitState.txData.hash) {
      dispatch({
        type: ClaimActionType.SET_COMMIT_TX_HASH,
        commitTxHash: commitState.txData.hash,
      });
    }
  }, [commitState.txData.hash, dispatch]);

  React.useEffect(() => {
    if (revealState.txData.hash) {
      dispatch({
        type: ClaimActionType.SET_CLAIM_TX_HASH,
        claimTxHash: revealState.txData.hash,
      });
    }
  }, [revealState.txData.hash, dispatch]);

  React.useEffect(() => {
    if (revealState.txState === TxState.Complete) {
      setTimeout(() => {
        dispatch({
          type: ClaimActionType.SET_CLAIM_STATUS,
          status: ClaimStatus.Finished,
        });
      }, 2000);
    }
  }, [revealState.txState, dispatch]);

  return (
    <div style={{ maxWidth: 480 }}>
      <BulletHeader tag="h2">
        {t("Step")} 1. {t("Select country")}
      </BulletHeader>
      <FormGroup
        label={t("Select your country or region of current residence")}
        labelFor="country-selector"
      >
        <CountrySelector
          code={state.claimData?.country!}
          onSelectCountry={(countryCode) =>
            dispatch({ type: ClaimActionType.SET_COUNTRY, countryCode })
          }
        />
      </FormGroup>
      <BulletHeader tag="h2">
        {t("Step")} 2. {t("commitTitle")}
      </BulletHeader>
      {state.claimData?.country ? (
        <ClaimStep1
          countryCode={state.claimData.country}
          txState={commitState}
          txDispatch={commitDispatch}
          completed={committed}
          onSubmit={commitClaim}
        />
      ) : (
        <p className="text-muted">{t("selectCountryPrompt")}</p>
      )}
      <BulletHeader tag="h2">
        {t("Step")} 3. {t("Claim tokens")}
      </BulletHeader>
      {committed || commitState.txState === TxState.Complete ? (
        <ClaimStep2
          txState={revealState}
          txDispatch={revealDispatch}
          amount={state.claimData?.claim.amount!}
          onSubmit={commitReveal}
        />
      ) : (
        <p className="text-muted">{t("claimNotReady")}</p>
      )}
    </div>
  );
};
