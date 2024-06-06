import { Link } from 'react-router-dom';

import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';

import { useT } from '../../lib/use-t';
import { type RowTransfer } from './asset-activity';

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
        {t('From')}:{' '}
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.from))}
          target="_blank"
          className="underline underline-offset-4"
        >
          {data.detail.from}
        </Link>
      </>
    );
  } else if (data.detail.from === partyId) {
    return (
      <>
        {t('To')}:{' '}
        <Link
          to={linkCreator(EXPLORER_PARTIES.replace(':id', data.detail.to))}
          target="_blank"
          className="underline underline-offset-4"
        >
          {data.detail.from}
        </Link>
      </>
    );
  }

  return <>-</>;
};
