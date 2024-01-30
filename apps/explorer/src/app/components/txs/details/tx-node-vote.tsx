import { t } from '@vegaprotocol/i18n';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import type { TendermintBlocksResponse } from '../../../routes/blocks/tendermint-blocks-response';
import { TxDetailsShared } from './shared/tx-details-shared';
import { TableCell, TableRow, TableWithTbody } from '../../table';
import type { ExplorerNodeVoteQueryResult } from './__generated__/Node-vote';
import { useExplorerNodeVoteQuery } from './__generated__/Node-vote';
import { PartyLink } from '../../links';
import { Time } from '../../time';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../links/external-explorer-link/external-explorer-link';

interface TxDetailsNodeVoteProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  blockData: TendermintBlocksResponse | undefined;
}

/**
 * If there is not yet a custom component for a transaction, just display
 * the basic details. This allows someone to view the decoded transaction.
 */
export const TxDetailsNodeVote = ({
  txData,
  pubKey,
  blockData,
}: TxDetailsNodeVoteProps) => {
  const id = txData?.command.nodeVote?.reference || '';

  const { data } = useExplorerNodeVoteQuery({
    variables: {
      id,
    },
    // Required as one of these queries will needlessly error
    errorPolicy: 'ignore',
  });

  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  return (
    <TableWithTbody className="mb-8" allowWrap={true}>
      <TxDetailsShared txData={txData} pubKey={pubKey} blockData={blockData} />
      {data && !!data.deposit
        ? TxDetailsNodeVoteDeposit({ deposit: data })
        : data && !!data.withdrawal
        ? TxDetailsNodeVoteWithdrawal({ withdrawal: data })
        : null}
    </TableWithTbody>
  );
};

interface TxDetailsNodeVoteDepositProps {
  deposit: ExplorerNodeVoteQueryResult['data'];
}

export function TxDetailsNodeVoteDeposit({
  deposit,
}: TxDetailsNodeVoteDepositProps) {
  if (!deposit) {
    return null;
  }
  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Witnessed Event type')}</TableCell>
        {deposit?.deposit?.txHash ? (
          <TableCell>{t('ERC20 deposit')}</TableCell>
        ) : (
          <TableCell>{t('Built-in asset deposit')}</TableCell>
        )}
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('To party')}:</TableCell>
        <TableCell>
          <PartyLink id={deposit?.deposit?.party?.id || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Credited on')}:</TableCell>
        <TableCell>
          <Time date={deposit?.deposit?.creditedTimestamp} />
        </TableCell>
      </TableRow>
      {deposit?.deposit?.txHash ? (
        <TxHash hash={deposit?.deposit?.txHash} />
      ) : null}
    </>
  );
}

interface TxDetailsNodeVoteWithdrawalProps {
  withdrawal: ExplorerNodeVoteQueryResult['data'];
}

export function TxDetailsNodeVoteWithdrawal({
  withdrawal,
}: TxDetailsNodeVoteWithdrawalProps) {
  if (!withdrawal) {
    return null;
  }
  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Witnessed Event type')}</TableCell>
        {withdrawal?.withdrawal?.txHash ? (
          <TableCell>{t('ERC20 withdrawal')}</TableCell>
        ) : (
          <TableCell>{t('Built-in asset withdrawal')}</TableCell>
        )}
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('From party')}:</TableCell>
        <TableCell>
          <PartyLink id={withdrawal?.deposit?.party?.id || ''} />
        </TableCell>
      </TableRow>
      <TableRow modifier="bordered">
        <TableCell>{t('Withdrawn on')}:</TableCell>
        <TableCell>
          <Time date={withdrawal?.withdrawal?.withdrawnTimestamp} />
        </TableCell>
      </TableRow>
      {withdrawal?.withdrawal?.txHash ? (
        <TxHash hash={withdrawal?.withdrawal?.txHash} />
      ) : null}
    </>
  );
}

interface TxDetailsEthTxHashProps {
  hash: string;
}

export function TxHash({ hash }: TxDetailsEthTxHashProps) {
  if (!hash) {
    return null;
  }
  return (
    <TableRow modifier="bordered">
      <TableCell>Ethereum TX:</TableCell>
      <TableCell>
        <ExternalExplorerLink id={hash} type={EthExplorerLinkTypes.tx} />
      </TableCell>
    </TableRow>
  );
}
