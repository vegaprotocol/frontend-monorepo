import * as Sentry from '@sentry/react';
import { UNSPENT_CODE } from '@vegaprotocol/smart-contracts';
import { format } from 'date-fns';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Tranche } from '@vegaprotocol/smart-contracts';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { useContracts } from '../../contexts/contracts/contracts-context';
import { DATE_FORMAT_LONG } from '../../lib/date-formats';
import { formatNumber } from '../../lib/format-number';
import { truncateMiddle } from '../../lib/truncate-middle';
import { ClaimInfo } from './claim-info';
import { ClaimActionType, ClaimStatus } from './claim-reducer';
import { CodeUsed } from './code-used';
import { Complete } from './complete';
import { Expired } from './expired';
import { TargetAddressMismatch } from './target-address-mismatch';
import { TargetedClaim } from './targeted-claim';
import { TrancheNotFound } from './tranche-not-found';
import { UntargetedClaim } from './untargeted-claim';
import { Verifying } from './verifying';
import type { ClaimAction, ClaimState } from './claim-reducer';

interface ClaimFlowProps {
  state: ClaimState;
  dispatch: React.Dispatch<ClaimAction>;
  address: string;
  tranches: Tranche[];
}

export const ClaimFlow = ({
  state,
  dispatch,
  address,
  tranches,
}: ClaimFlowProps) => {
  const { t } = useTranslation();
  const currentTranche = tranches.find(
    (tranche) => tranche.tranche_id === state.claimData?.claim.tranche
  );
  const { claim } = useContracts();
  // eslint-disable-next-line
  const code = state.claimData?.signature.s!;
  const shortCode = truncateMiddle(code);

  // Check that the claim is valid, by checking if its already committed, expired, or used
  React.useEffect(() => {
    const run = async () => {
      dispatch({ type: ClaimActionType.SET_LOADING, loading: true });
      try {
        if (!state.claimData) {
          throw new Error('No claim data');
        }
        const [committed, expired, used] = await Promise.all([
          claim.isCommitted({ s: code }),
          claim.isExpired(state.claimData.claim.expiry),
          claim.isUsed(code),
        ]);

        dispatch({
          type: ClaimActionType.SET_INITIAL_CLAIM_STATUS,
          committed: committed !== UNSPENT_CODE,
          expired,
          used,
        });
      } catch (e) {
        Sentry.captureException(e);
        dispatch({
          type: ClaimActionType.ERROR,
          error: e as Error,
        });
      } finally {
        dispatch({ type: ClaimActionType.SET_LOADING, loading: false });
      }
    };
    run();
  }, [address, claim, code, dispatch, state.claimData]);

  if (!currentTranche) {
    return <TrancheNotFound />;
  }

  if (state.loading) {
    return <Verifying />;
  }

  if (state.claimStatus === ClaimStatus.Used) {
    return <CodeUsed />;
  }

  if (state.claimStatus === ClaimStatus.Expired) {
    return <Expired code={shortCode} />;
  }

  if (state.claimStatus === ClaimStatus.Finished && state.claimData) {
    return (
      <Complete
        address={address}
        balanceFormatted={state.claimData.claim.amount}
        commitTxHash={state.commitTxHash}
        claimTxHash={state.claimTxHash}
      />
    );
  }

  if (
    state.claimData?.claim.target &&
    state.claimData?.claim.target.toLowerCase() !== address.toLowerCase()
  ) {
    return (
      <TargetAddressMismatch
        connectedAddress={address}
        expectedAddress={state.claimData.claim.target}
      />
    );
  }

  return (
    <>
      <section>
        <div className="lg:grid lg:gap-24 lg:grid-cols-[1fr_1fr] lg:grid-rows-[min-content_min-content]">
          <div>
            <p>
              <Trans
                i18nKey="claim"
                values={{
                  user: state.claimData?.claim.target
                    ? truncateMiddle(state.claimData?.claim.target)
                    : t('the holder'),
                  code: shortCode,
                  amount: state.claimData?.claim.amount,
                  linkText: `${t('Tranche')} ${currentTranche.tranche_id}`,
                  expiry: state.claimData?.claim.expiry
                    ? t('claimExpiry', {
                        date: format(
                          state.claimData?.claim.expiry * 1000,
                          DATE_FORMAT_LONG
                        ),
                      })
                    : t('claimNoExpiry'),
                }}
                components={{
                  bold: <strong />,
                  trancheLink: (
                    <Link to={`/tranches/${currentTranche.tranche_id}`} />
                  ),
                }}
              />
            </p>
            <ClaimInfo tranche={currentTranche} />
          </div>
          <div>
            <KeyValueTable>
              <KeyValueTableRow>
                {t('Connected Ethereum address')}
                {truncateMiddle(address)}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('Amount of VEGA')}

                {state.claimData
                  ? formatNumber(state.claimData.claim.amount)
                  : 'None'}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('Claim expires')}

                {state.claimData?.claim.expiry
                  ? format(
                      state.claimData?.claim.expiry * 1000,
                      DATE_FORMAT_LONG
                    )
                  : 'No expiry'}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('Starts unlocking')}

                {format(currentTranche.tranche_start, DATE_FORMAT_LONG)}
              </KeyValueTableRow>
              <KeyValueTableRow>
                {t('Fully unlocked')}
                {format(currentTranche.tranche_end, DATE_FORMAT_LONG)}
              </KeyValueTableRow>
            </KeyValueTable>
          </div>
        </div>
      </section>
      <section>
        {/* If targeted we do not need to commit reveal, as there is no change of front running the mem pool */}
        {state.claimData?.claim.target ? (
          <TargetedClaim
            address={address}
            claimData={state.claimData}
            state={state}
            dispatch={dispatch}
          />
        ) : (
          state.claimData && (
            <UntargetedClaim
              address={address}
              committed={state.claimStatus === ClaimStatus.Committed}
              claimData={state.claimData}
              state={state}
              dispatch={dispatch}
            />
          )
        )}
      </section>
    </>
  );
};
