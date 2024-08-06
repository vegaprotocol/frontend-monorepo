import { CollapsiblePanel } from '@/components/collapsible-panel';
import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { ExternalLink } from '@/components/external-link';
import { PartyLink } from '@/components/vega-entities/party-link';
import { TeamLink } from '@/components/vega-entities/team-link';
import { VegaSection } from '@/components/vega-section';

export const ReferralSetInformation = ({
  referralSetData,
}: {
  referralSetData: any;
}) => {
  const allowList = referralSetData.team?.allowList;
  const items: RowConfig<typeof referralSetData>[] = [
    {
      prop: 'id',
      render: (id) => [
        'Id',
        <TeamLink key="referral-set-information-id" id={id} />,
      ],
    },
    { prop: 'isTeam', render: (isTeam) => ['Team', isTeam ? 'Yes' : 'No'] },
    { prop: 'team.name', render: (name) => ['Name', name] },
    {
      prop: 'team.teamUrl',
      render: (teamUrl) => [
        'Team URL',
        <ExternalLink key="referral-set-information-team" href={teamUrl}>
          {teamUrl}
        </ExternalLink>,
      ],
    },
    {
      prop: 'team.avatarUrl',
      render: (avatarUrl) => [
        'Avatar URL',
        <ExternalLink key="referral-set-information-avatar" href={avatarUrl}>
          {avatarUrl}
        </ExternalLink>,
      ],
    },
    {
      prop: 'team.closed',
      render: (closed) => ['Closed', closed ? 'Yes' : 'No'],
    },
  ];
  const allowedPublicKeys = allowList as string[];
  return (
    <>
      <ConditionalDataTable items={items} data={referralSetData} />
      {allowedPublicKeys && (
        <VegaSection>
          <CollapsiblePanel
            title="Allow list"
            panelContent={
              allowedPublicKeys.length === 0 ? (
                'No public keys allowed'
              ) : (
                <ul>
                  {allowedPublicKeys.map((publicKey) => (
                    <div key={publicKey}>
                      <PartyLink publicKey={publicKey} />
                    </div>
                  ))}
                </ul>
              )
            }
          />
        </VegaSection>
      )}
    </>
  );
};
