import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import { useMemo, type ComponentProps } from 'react';
import Hash from '../hash';
import { t } from '@vegaprotocol/i18n';
import { isValidPartyId } from '../../../routes/parties/id/components/party-id-error';
import { Icon, truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { useExplorerNodeNamesQuery } from '../../../routes/validators/__generated__/NodeNames';
import type { ExplorerNodeNamesQuery } from '../../../routes/validators/__generated__/NodeNames';

export const SPECIAL_CASE_NETWORK_ID =
  '0000000000000000000000000000000000000000000000000000000000000000';
export const SPECIAL_CASE_NETWORK = 'network';

export function getNameForParty(id: string, data?: ExplorerNodeNamesQuery) {
  if (!data || data?.nodesConnection?.edges?.length === 0) {
    return id;
  }

  const validator = data.nodesConnection.edges?.find((e) => {
    return e?.node.pubkey === id;
  });

  if (validator) {
    return validator.node.name;
  }

  return id;
}

export type PartyLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
  truncate?: boolean;
};

const PartyLink = ({ id, truncate = false, ...props }: PartyLinkProps) => {
  const { data } = useExplorerNodeNamesQuery();
  const name = useMemo(() => getNameForParty(id, data), [data, id]);
  const useName = name !== id;

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
    <span className="whitespace-nowrap">
      {useName && <Icon size={4} name="cube" className="mr-2" />}
      <Link
        className="underline font-mono"
        {...props}
        to={`/${Routes.PARTIES}/${id}`}
      >
        {useName ? (
          name
        ) : (
          <Hash text={truncate ? truncateMiddle(id, 4, 4) : id} />
        )}
      </Link>
    </span>
  );
};

export default PartyLink;
