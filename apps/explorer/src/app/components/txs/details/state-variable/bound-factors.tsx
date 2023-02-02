import { t } from '@vegaprotocol/react-helpers';
import type { components } from '../../../../../types/explorer';
import { Table, TableRow, TableHeader, TableCell } from '../../../table';

interface StateVariableProposalBoundFactorsProps {
  kvb: readonly components['schemas']['vegaKeyValueBundle'][];
}

/**
 * A dumb as rocks function completely tied to what the structure of this variable should be
 * @param kvb The key/value bundle
 * @returns Object
 */
export function getValues(kvb: StateVariableProposalBoundFactorsProps['kvb']) {
  const template = {
    up: {
      tolerance: '-',
      value: '-',
    },
    down: {
      tolerance: '-',
      value: '-',
    },
  };

  kvb.forEach((v) => {
    if (v.key === 'up') {
      template.up.tolerance = v.tolerance || '-';
      template.up.value = v.value?.vectorVal?.value
        ? v.value?.vectorVal.value[0]
        : '-';
    } else if (v.key === 'down') {
      template.down.tolerance = v.tolerance || '-';
      template.down.value = v.value?.vectorVal?.value
        ? v.value?.vectorVal.value[0]
        : '-';
    }
  });

  return template;
}

/**
 * State Variable proposals updating Bound Factors. This contains two bundles,
 * an up vector and a down vector
 *
 * This is nearly identical to risk factors.
 */
export const StateVariableProposalBoundFactors = ({
  kvb,
}: StateVariableProposalBoundFactorsProps) => {
  const v = getValues(kvb);

  return (
    <Table allowWrap={true} className="w-1/3">
      <thead>
        <TableRow modifier="bordered">
          <TableHeader align="left">{t('Parameter')}</TableHeader>
          <TableHeader align="center">{t('New value')}</TableHeader>
          <TableHeader align="right">{t('Tolerance')}</TableHeader>
        </TableRow>
      </thead>
      <tbody>
        <TableRow modifier="bordered">
          <TableCell>{t('Up')}</TableCell>
          <TableCell align="right" className="font-mono">
            {v.up.value}
          </TableCell>
          <TableCell align="right" className="font-mono">
            {v.up.tolerance}
          </TableCell>
        </TableRow>
        <TableRow modifier="bordered">
          <TableCell>{t('Down')}</TableCell>
          <TableCell align="right" className="font-mono">
            {v.down.value}
          </TableCell>
          <TableCell align="right" className="font-mono">
            {v.down.tolerance}
          </TableCell>
        </TableRow>
      </tbody>
    </Table>
  );
};
