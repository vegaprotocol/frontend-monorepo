import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { sharedHeaderProps, TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { components } from '../../../../types/explorer';
import { txSignatureToDeterministicId } from '../lib/deterministic-ids';
import has from 'lodash/has';
import { ProposalSummary } from './proposal/summary';
import Hash from '../../links/hash';
import { t } from '@vegaprotocol/i18n';
import { ProposalSignatureBundleNewAsset } from './proposal/signature-bundle-new';
import { ProposalSignatureBundleUpdateAsset } from './proposal/signature-bundle-update';
import { MarketLink } from '../../links';
import { formatNumber } from '@vegaprotocol/utils';

export type Proposal = components['schemas']['v1ProposalSubmission'];
export type ProposalTerms = components['schemas']['vegaProposalTerms'];

interface TxProposalProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Detects if a given proposal requires a signature bundle to be emitted by the validators for
 * the proposal to be completed after it is accepted by the governance vote
 *
 * @param t The details of the proposal
 * @returns boolean True if a signature bundle is required. Used to fetch a signature bundle
 */
export function proposalRequiresSignatureBundle(proposal?: Proposal): boolean {
  const proposalsThatRequireBundles = ['newAsset', 'updateAsset'];

  if (!proposal?.terms) {
    return false;
  }

  return (
    proposalsThatRequireBundles.filter((requiredIfExists) =>
      has(proposal.terms, requiredIfExists)
    ).length > 0
  );
}

/**
 * Given a proposal, returns a nice text label for the proposal type
 *
 * @param terms The details of the proposal
 * @returns string Proposal type
 */
export function proposalTypeLabel(terms?: ProposalTerms): string {
  if (has(terms, 'newAsset')) {
    return t('New asset proposal');
  } else if (has(terms, 'updateAsset')) {
    return t('Update asset proposal');
  } else if (has(terms, 'newMarket')) {
    if (terms?.newMarket?.changes?.successor) {
      return t('Successor market proposal');
    } else {
      return t('New market proposal');
    }
  } else if (has(terms, 'updateMarket')) {
    return t('Update market proposal');
  } else if (has(terms, 'updateNetworkParameter')) {
    return t('Update network parameter');
  } else if (has(terms, 'newFreeform')) {
    return t('Freeform proposal');
  }

  // The list above contains all currently known types. This will be triggered if a new
  // unrecognised proposal type is added.
  return t('Governance proposal');
}

/**
 * A proposal. It's more simplistic than man other views because there are already other, better
 * ways to view things about a proposal!
 *
 */
export const TxProposal = ({ txData, pubKey, blockData }: TxProposalProps) => {
  if (!txData || !txData.command.proposalSubmission) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }
  let deterministicId = '';

  const proposal: Proposal = txData.command.proposalSubmission;
  const sig = txData?.signature?.value;
  if (sig) {
    deterministicId = txSignatureToDeterministicId(sig);
  }

  const tx = proposal.terms?.newAsset || proposal.terms?.updateAsset;
  const isSuccessorMarketProposal =
    proposal?.terms?.newMarket?.changes?.successor;
  const parentMarketId =
    isSuccessorMarketProposal &&
    proposal?.terms.newMarket?.changes?.successor?.parentMarketId;
  const insurancePoolFraction =
    proposal?.terms?.newMarket?.changes?.successor?.insurancePoolFraction;

  // This component is not rendered if no bundle is required
  const SignatureBundleComponent = proposal.terms?.newAsset
    ? ProposalSignatureBundleNewAsset
    : ProposalSignatureBundleUpdateAsset;

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TableRow modifier="bordered">
          <TableCell {...sharedHeaderProps}>{t('Type')}</TableCell>
          <TableCell>{proposalTypeLabel(proposal.terms)}</TableCell>
        </TableRow>
        {/* TODO: Disable type row */}
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
          hideTypeRow={true}
        />
        <TableRow modifier="bordered">
          <TableCell>{t('Proposal ID')}</TableCell>
          <TableCell>
            <Hash text={deterministicId} />
          </TableCell>
        </TableRow>
        {isSuccessorMarketProposal ? (
          <>
            {parentMarketId ? (
              <TableRow modifier="bordered">
                <TableCell>{t('Previous market')}</TableCell>
                <TableCell>
                  <MarketLink
                    id={
                      proposal.terms?.newMarket.changes.successor.parentMarketId
                    }
                  />
                </TableCell>
              </TableRow>
            ) : null}
            {insurancePoolFraction ? (
              <TableRow modifier="bordered">
                <TableCell>{t('Insurance pool fraction')}</TableCell>
                <TableCell>
                  {formatNumber(Number(insurancePoolFraction) * 100, 0)}%
                </TableCell>
              </TableRow>
            ) : null}
          </>
        ) : null}
      </TableWithTbody>
      <ProposalSummary
        id={deterministicId}
        rationale={proposal.rationale}
        terms={proposal?.terms}
      />
      {proposalRequiresSignatureBundle(proposal) && (
        <SignatureBundleComponent id={deterministicId} tx={tx} />
      )}
    </>
  );
};
