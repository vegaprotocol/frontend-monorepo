import { Link } from 'react-router-dom';

import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';

import { useT } from '../../lib/use-t';
import { type RowTransfer } from './asset-activity';
import {
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';

export const TransferToFromCell = ({
  data,
  partyId,
}: {
  data: RowTransfer;
  partyId?: string;
}) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Explorer);

  if (data.detail.to === partyId) {
    return (
      <>
        <span className="inline-block w-9">{t('From')}:</span>
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.from))}
          target="_blank"
          className="inline-flex items-center gap-1 underline underline-offset-4"
        >
          {truncateMiddle(data.detail.from)}
          <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
        </Link>
      </>
    );
  } else if (data.detail.from === partyId) {
    return (
      <>
        <span className="inline-block w-9">{t('To')}:</span>
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.to))}
          target="_blank"
          className="inline-flex items-center gap-1 underline underline-offset-4"
        >
          {truncateMiddle(data.detail.from)}
          <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
        </Link>
      </>
    );
  }

  return <>-</>;
};
