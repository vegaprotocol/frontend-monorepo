import { useNetwork } from '@/contexts/network/network-context';

import { CONSTANTS } from '../../../../lib/constants';
import { ExternalLink } from '../../../external-link';

export const locators = {
  description1: 'description1',
  description2: 'description2',
  description3: 'description3',
  explorerLink: 'explorer-link',
  documentationLink: 'docs-link',
  decimalTooltip: 'decimal-tooltip',
};

export const DecimalTooltip = ({
  variableName,
  entityLink,
  entityText,
}: {
  entityLink: string;
  entityText: string;
  variableName: string;
}) => {
  const { docs } = useNetwork();

  const documentationHref = `${docs}/api/using-the-apis#decimal-precision`;
  return (
    <div
      data-testid={locators.decimalTooltip}
      style={{ maxWidth: CONSTANTS.width - 60 }}
    >
      <p data-testid={locators.description1}>
        This number does not include a decimal point.
      </p>

      <p data-testid={locators.description2} className="mt-1">
        To get the value including decimals, find the{' '}
        <ExternalLink data-testid={locators.explorerLink} href={entityLink}>
          {entityText}
        </ExternalLink>{' '}
        on the block explorer and divide the amount by{' '}
        <code>
          10<sup>{variableName}</sup>
        </code>{' '}
        e.g. <code>1000</code> with a <code>{variableName}</code> value of{' '}
        <code>2</code> would become{' '}
        <code>
          1000 ÷ 10<sup>2</sup> = 10
        </code>
        .{' '}
      </p>
      <p data-testid={locators.description3} className="mt-1">
        <ExternalLink
          data-testid={locators.documentationLink}
          href={documentationHref}
        >
          Read more
        </ExternalLink>
      </p>
    </div>
  );
};
