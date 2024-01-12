import { TableCell } from '../../../table';
import { useExplorerReferralCodeOwnerQuery } from './__generated__/code-owner';
import { PartyLink } from '../../../links';

export interface ReferralCodeOwnerProps {
  code: string;
}

/**
 * Render the owner of a referral code
 */
export const ReferralCodeOwner = ({ code }: ReferralCodeOwnerProps) => {
  const { data, error, loading } = useExplorerReferralCodeOwnerQuery({
    variables: {
      id: code,
    },
  });
  const referrer = data?.referralSets.edges[0]?.node.referrer || '';
  return (
    <TableCell>
      {loading && 'Loading...'}
      {error && `Error fetching referrer: ${referrer}`}
      {referrer.length > 0 && <PartyLink id={referrer} />}
    </TableCell>
  );
};
