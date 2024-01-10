import {
  Icon,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import type { components } from '../../../../../types/explorer';
import Hash from '../../../links/hash';
import { t } from 'i18next';
import { PartyLink } from '../../../links';

export type CreateReferralSet = components['schemas']['v1CreateReferralSet'];
export type ReferralTeam = CreateReferralSet['team'];

export interface ReferralTeamProps {
  tx: CreateReferralSet;
  id: string;
  creator: string;
}

/**
 * Renders the details for a team in a CreateReferralSet or UpdateReferralSet transaction.
 *
 * Intentionally does not render the avatar image or link to the team url.
 */
export const ReferralTeam = ({ tx, id, creator }: ReferralTeamProps) => {
  if (!tx.team) {
    return null;
  }

  return (
    <section>
      {tx.team.name && <h3>{tx.team.name}</h3>}
      <KeyValueTable>
        <KeyValueTableRow>
          {t('Id')}
          <Hash text={id} truncate={false} />
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('Creator')}
          <PartyLink id={creator} truncate={false} />
        </KeyValueTableRow>
        {tx.team.teamUrl && (
          <KeyValueTableRow>
            {t('Team URL')}
            <Hash text={tx.team.teamUrl} truncate={false} />
          </KeyValueTableRow>
        )}
        {tx.team.avatarUrl && (
          <KeyValueTableRow>
            {t('Avatar')}
            <Hash text={tx.team.avatarUrl} truncate={false} />
          </KeyValueTableRow>
        )}
        <KeyValueTableRow>
          {t('Open')}
          <span data-testid={!tx.team.closed ? 'open-yes' : 'open-no'}>
            {!tx.team.closed ? <Icon name="tick" /> : <Icon name="cross" />}
          </span>
        </KeyValueTableRow>
      </KeyValueTable>
    </section>
  );
};
