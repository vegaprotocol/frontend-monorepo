import { TableCell, TableRow } from '../../../table';
import { t } from '@vegaprotocol/i18n';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../links/eth-explorer-link/eth-explorer-link';
import type { components } from '../../../../../types/explorer';
import { defaultAbiCoder, base64 } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import OracleLink from '../../../links/oracle-link/oracle-link';
import { useExplorerOracleSpecByIdQuery } from '../../../../routes/oracles/__generated__/Oracles';
import { OracleEthSource } from '../../../../routes/oracles/components/oracle-eth-source';

/**
 * Decodes the b64/ABIcoded result from an eth cal
 * @param data
 * @returns
 */
export function decodeEthCallResult(contractData: string): string {
  try {
    const rawResult = defaultAbiCoder.decode(
      ['int256'],
      base64.decode(contractData)
    );

    // Finally, convert the resulting BigNumber in to a string
    const res = BigNumber.from(rawResult[0]).toString();
    return res;
  } catch (e) {
    return '-';
  }
}

interface TxDetailsContractCallProps {
  contractCall: components['schemas']['vegaEthContractCallEvent'];
}

export const TxDetailsContractCall = ({
  contractCall,
}: TxDetailsContractCallProps) => {
  const { data } = useExplorerOracleSpecByIdQuery({
    variables: {
      id: contractCall.specId || '1',
    },
  });

  if (!contractCall || !contractCall.result) {
    return null;
  }

  return (
    <>
      {contractCall.specId && (
        <TableRow modifier="bordered">
          <TableCell>{t('Oracle')}</TableCell>
          <TableCell>
            <OracleLink
              id={contractCall.specId}
              hasSeenOracleReports={true}
              status={data?.oracleSpec?.dataSourceSpec.spec.status || '-'}
            />
          </TableCell>
        </TableRow>
      )}
      {contractCall.blockHeight && (
        <TableRow modifier="bordered">
          <TableCell>{t('ETH block')}</TableCell>
          <TableCell>
            <EthExplorerLink
              id={contractCall.blockHeight}
              type={EthExplorerLinkTypes.block}
            />
          </TableCell>
        </TableRow>
      )}
      {data?.oracleSpec?.dataSourceSpec && (
        <OracleEthSource
          sourceType={data.oracleSpec.dataSourceSpec.spec.data.sourceType}
        />
      )}

      <TableRow modifier="bordered">
        <TableCell>{t('Result')}</TableCell>
        <TableCell>{decodeEthCallResult(contractCall.result)}</TableCell>
      </TableRow>
    </>
  );
};
