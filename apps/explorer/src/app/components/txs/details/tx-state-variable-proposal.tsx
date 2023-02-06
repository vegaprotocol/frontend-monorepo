import { t } from '@vegaprotocol/react-helpers';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { MarketLink } from '../../links';

import type { components } from '../../../../types/explorer';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { StateVariableProposalWrapper } from './state-variable/data-wrapper';

interface TxDetailsStateVariableProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * There is no market ID in the event, but it appears to be encoded in to the variable
 * ID so let's pull it out. MarketLink component will handle if it isn't a real market.
 *
 * Given how liable to break this is, it's wrapped in a try catch
 *
 * @param stateVarId The full state variable proposal variable name
 * @returns null or a string market id
 */
export function hackyGetMarketFromStateVariable(
  stateVarId?: string
): string | null {
  try {
    const res = stateVarId ? stateVarId.split('_')[1] : null;
    return res && res.length === 64 ? res : null;
  } catch (e) {
    return null;
  }
}

/**
 * There is no event name in the event, but it appears to be encoded in to the variable
 * ID so let's pull it out. Will display nothing if it doesn't parse as expected
 *
 * Given how liable to break this is, it's wrapped in a try catch
 *
 * @param stateVarId The full state variable proposal variable name
 * @returns null or a string variable name
 */
export function hackyGetVariableFromStateVariable(
  stateVarId?: string
): string | null {
  try {
    if (!stateVarId) {
      return null;
    }

    return stateVarId.split('_').slice(2).join(' ').replace('-', ' ');
  } catch (e) {
    return null;
  }
}

/**
 * State Variable proposals
 */
export const TxDetailsStateVariable = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsStateVariableProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const command: components['schemas']['v1StateVariableProposal'] =
    txData.command.stateVariableProposal;

  const variable = hackyGetVariableFromStateVariable(
    command.proposal?.stateVarId
  );
  const marketId = hackyGetMarketFromStateVariable(
    command.proposal?.stateVarId
  );

  return (
    <>
      <TableWithTbody className="mb-8" allowWrap={true}>
        <TxDetailsShared
          txData={txData}
          pubKey={pubKey}
          blockData={blockData}
        />
        {marketId ? (
          <TableRow modifier="bordered">
            <TableCell>{t('Market')}</TableCell>
            <TableCell>
              <MarketLink id={marketId} />
            </TableCell>
          </TableRow>
        ) : null}
        <TableRow modifier="bordered">
          <TableCell>{t('Variable')}</TableCell>
          <TableCell className="capitalize">
            <span>{variable}</span>
          </TableCell>
        </TableRow>
      </TableWithTbody>
      <section>
        <StateVariableProposalWrapper
          stateVariable={command.proposal?.stateVarId}
          kvb={command.proposal?.kvb}
        />
      </section>
    </>
  );
};
