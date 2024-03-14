import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { SourceType } from './oracle';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/external-explorer-link/external-explorer-link';
import { getExternalChainLabel } from '@vegaprotocol/environment';
import { t } from 'i18next';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import isArray from 'lodash/isArray';

interface OracleDetailsEthSourceProps {
  sourceType: SourceType;
  chain?: string;
}
/**
 * Given an Oracle that sources data from Ethereum, this component will render
 * a link to the smart contract and some basic details
 */
export function OracleEthSource({
  sourceType,
  chain = '1',
}: OracleDetailsEthSourceProps) {
  if (
    sourceType.__typename !== 'DataSourceDefinitionExternal' ||
    sourceType.sourceType.__typename !== 'EthCallSpec'
  ) {
    return null;
  }

  const address = sourceType.sourceType.address;

  if (!address) {
    return null;
  }

  const chainLabel = getExternalChainLabel(chain);

  const abi = prepareAbi(sourceType?.sourceType?.abi);
  const args = prepareAbi(sourceType?.sourceType?.args);

  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row" className="pt-1 align-text-top">
        {chainLabel} {t('Contract')}
      </TableHeader>
      <TableCell modifier="bordered">
        <details>
          <summary className="cursor-pointer">
            <ExternalExplorerLink
              chain={chain}
              id={address}
              type={EthExplorerLinkTypes.address}
              code={true}
            />
            <span className="mx-3">&rArr;</span>
            <code>{sourceType.sourceType.method}</code>
          </summary>

          {args && (
            <>
              <h2 className={'mt-5 mb-1 text-xl'}>{t('Arguments')}</h2>
              <div className="max-w-3">
                <SyntaxHighlighter
                  data={JSON.parse(
                    sourceType.sourceType.args as unknown as string
                  )}
                />
              </div>
            </>
          )}

          {abi && (
            <>
              <h2 className={'mt-5 mb-1 text-xl'}>{t('ABI')}</h2>
              <div className="max-w-3">
                <SyntaxHighlighter data={abi} />
              </div>
            </>
          )}

          <h2 className={'mt-5 mb-1 text-xl'}>{t('Normalisers')}</h2>
          <div className="max-w-3 mb-3">
            <SyntaxHighlighter
              data={JSON.parse(
                JSON.stringify(
                  sourceType.sourceType.normalisers as unknown as string
                )
              )}
            />
          </div>
        </details>
      </TableCell>
    </TableRow>
  );
}

const NO_DATA = false;

export function prepareAbi(abi?: string[] | null): string | false {
  if (!abi) {
    return NO_DATA;
  }

  try {
    if (isArray(abi)) {
      return JSON.parse(abi.join(''));
    } else {
      return JSON.parse(abi);
    }
  } catch (e) {
    return NO_DATA;
  }
}
