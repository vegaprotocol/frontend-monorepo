import { t } from '@vegaprotocol/i18n';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import { BlockLink } from '../../links';
import { StatusMessage } from '../../status-message';
import { ENV } from '../../../config/env';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import type { components } from '../../../../types/explorer';

interface TxDetailsProtocolUpgradeProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * Validator event: Protocol Upgrade proposal
 */
export const TxDetailsProtocolUpgrade = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsProtocolUpgradeProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const upgrade: components['schemas']['v1ProtocolUpgradeProposal'] =
    txData.command.protocolUpgradeProposal;

  if (!upgrade || !upgrade.upgradeBlockHeight || !upgrade.vegaReleaseTag) {
    return (
      <StatusMessage>{t('Invalid upgrade proposal format')}</StatusMessage>
    );
  }

  const urlBase = ENV.dataSources.vegaRepoUrl;
  const release = upgrade.vegaReleaseTag;

  return (
    <TableWithTbody className="mb-8">
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      <TableRow modifier="bordered">
        <TableCell>{t('Upgrade at block')}</TableCell>
        <TableCell>
          <BlockLink height={upgrade.upgradeBlockHeight} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Upgrade to')}</TableCell>
        <TableCell>
          <ExternalLink href={`${urlBase}${release}`}>
            {upgrade.vegaReleaseTag}
          </ExternalLink>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
