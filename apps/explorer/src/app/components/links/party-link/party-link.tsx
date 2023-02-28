import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';
import { t } from '@vegaprotocol/i18n';
import { isValidPartyId } from '../../../routes/parties/id/components/party-id-error';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

export const SPECIAL_CASE_NETWORK_ID =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const SPECIAL_CASE_NETWORK = 'network';

export type PartyLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
  truncate?: boolean;
};

const PartyLink = ({ id, truncate = false, ...props }: PartyLinkProps) => {
  // Some transactions will involve the 'network' party, which is alias for  '000...000'
  // The party page does not handle this nicely, so in this case we render the word 'Network'
  if (id === SPECIAL_CASE_NETWORK || id === SPECIAL_CASE_NETWORK_ID) {
    return (
      <span className="font-mono" data-testid="network">
        {t('Network')}
      </span>
    );
  }

  // If the party doesn't look correct, there's no point in linking to id. Just render
  // the ID as it was given to us
  if (!isValidPartyId(id)) {
    return (
      <span className="font-mono" data-testid="invalid-party">
        {id}
      </span>
    );
  }

  return (
    <Link
      className="underline font-mono"
      {...props}
      to={`/${Routes.PARTIES}/${id}`}
    >
      <Hash text={truncate ? truncateMiddle(id) : id} />
    </Link>
  );
};

export default PartyLink;
