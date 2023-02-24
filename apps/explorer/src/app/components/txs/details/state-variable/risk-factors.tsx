import { t } from '@vegaprotocol/utils';
import zip from 'lodash/zip';
import type { components } from '../../../../../types/explorer';
import { Table, TableRow, TableHeader, TableCell } from '../../../table';
import { StateVariableProposalUnknown } from './unknown';

interface StateVariableProposalRiskFactorsProps {
  kvb: readonly components['schemas']['vegaKeyValueBundle'][];
}

/**
 * A dumb as rocks function completely tied to what the structure of this variable should be
 *
 * @param kvb The key/value bundle
 * @returns Object
 */
export function getValues(kvb: StateVariableProposalRiskFactorsProps['kvb']) {
  try {
    const template = {
      bid: {
        offsetTolerance: '-',
        probabilityTolerance: '-',
        offset: [] as Readonly<string[]>,
        probability: [] as Readonly<string[]>,
        rows: [] as [string | undefined, string | undefined][],
      },
      ask: {
        offsetTolerance: '-',
        probabilityTolerance: '-',
        offset: [] as Readonly<string[]>,
        probability: [] as Readonly<string[]>,
        rows: [] as [string | undefined, string | undefined][],
      },
    };

    kvb.forEach((v) => {
      if (v.key === 'bidOffset') {
        template.bid.offsetTolerance = v.tolerance || '-';
        template.bid.offset = v.value?.vectorVal?.value
          ? v.value?.vectorVal?.value
          : ['0'];
      } else if (v.key === 'bidProbability') {
        template.bid.probabilityTolerance = v.tolerance || '-';
        template.bid.probability = v.value?.vectorVal?.value
          ? v.value?.vectorVal?.value
          : ['0'];
      } else if (v.key === 'askOffset') {
        template.ask.offsetTolerance = v.tolerance || '-';
        template.ask.offset = v.value?.vectorVal?.value
          ? v.value?.vectorVal?.value
          : ['0'];
      } else if (v.key === 'askProbability') {
        template.ask.probabilityTolerance = v.tolerance || '-';
        template.ask.probability = v.value?.vectorVal?.value
          ? v.value?.vectorVal?.value
          : ['0'];
      }
    });

    // Bundles up offset and probability in to a row
    if (template.bid.offset.length > 0 && template.bid.probability.length > 0) {
      template.bid.rows = zip(template.bid.offset, template.bid.probability);
    }
    if (template.ask.offset.length > 0 && template.ask.probability.length > 0) {
      template.ask.rows = zip(template.ask.offset, template.ask.probability);
    }

    return template;
  } catch (e) {
    // This will result in the table not being rendered
    return null;
  }
}

/**
 * State Variable proposals updating Risk Factors. This contains two bundles,
 * a long vector and a short vector
 */
export const StateVariableProposalRiskFactors = ({
  kvb,
}: StateVariableProposalRiskFactorsProps) => {
  const v = getValues(kvb);
  const all = v ? zip(v.bid.rows, v.ask.rows) : [];

  if (all.length === 0) {
    // Give up, do a JSON view
    return <StateVariableProposalUnknown kvb={kvb} />;
  }

  return (
    <Table allowWrap={true} className="text-xs lg:text-base max-w-2xl">
      <thead>
        <TableRow modifier="bordered">
          <TableHeader align="left">{t('Mid offset')}</TableHeader>
          <TableHeader align="right">{t('Bid probability')}</TableHeader>
          <TableHeader align="right" className="pl-2">
            {t('Ask probability')}
          </TableHeader>
        </TableRow>
      </thead>
      <tbody>
        {all.map((r) => {
          // Simple remapping of the data to protect against undefineds
          const row = {
            o: r[0] ? r[0][0] : r[1] ? r[1][0] : '-',
            b: r[0] ? r[0][1] : '-',
            a: r[1] ? r[1][1] : '-',
          };
          return (
            <TableRow key={`${row.o}${row.b}${row.a}`}>
              <TableCell align="left">{row.o}</TableCell>
              <TableCell align="right" className="font-mono">
                {row.b}
              </TableCell>
              <TableCell align="right" className="pl-2 font-mono">
                {row.a}
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
};
