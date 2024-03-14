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
import type { components } from '../../../../types/explorer';

type Normalisers = components['schemas']['vegaNormaliser'][];

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

  const abi = prepareOracleSpecField(sourceType?.sourceType?.abi);
  const args = prepareOracleSpecField(sourceType?.sourceType?.args);
  const normalisers = serialiseNormalisers(sourceType.sourceType.normalisers);

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

          {normalisers && (
            <>
              <h2 className={'mt-5 mb-1 text-xl'}>{t('Normalisers')}</h2>
              <div className="max-w-3 mb-3">
                <SyntaxHighlighter data={normalisers} />
              </div>
            </>
          )}
        </details>
      </TableCell>
    </TableRow>
  );
}

// Constant to define the absence of a valid string from the Oracle Spec fields
const NO_DATA = false;

/**
 * The ABI and args are stored as either a (JSON escaped, probably) string
 * or array of strings. Given that OracleEthSource is simply throwing the
 * data in to a SyntaxHighlighter, we don't really care about the format,
 * so this function will just try to parse the data and return it as a string.
 *
 * @param abi
 * @returns
 */
export function prepareOracleSpecField(
  specField?: string[] | null
): string | false {
  if (!specField) {
    return NO_DATA;
  }

  try {
    if (isArray(specField)) {
      return JSON.parse(specField.join(''));
    } else {
      return JSON.parse(specField);
    }
  } catch (e) {
    return NO_DATA;
  }
}

/**
 * Similar to prepareOracleSpecField above, but processes an array of normaliser objects
 * removing the __typename and returning a serialised array of normalisers for
 * SyntaxHighlighter
 *
 * @param normalisers
 * @returns
 */
export function serialiseNormalisers(
  normalisers?: Normalisers | null
): Normalisers | false {
  if (!normalisers) {
    return NO_DATA;
  }

  try {
    return normalisers.map((normaliser) => {
      return {
        name: normaliser.name,
        expression: normaliser.expression,
      };
    });
  } catch (e) {
    return NO_DATA;
  }
}
