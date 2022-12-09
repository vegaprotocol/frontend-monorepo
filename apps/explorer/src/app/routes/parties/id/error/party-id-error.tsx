import { remove0x, t } from '@vegaprotocol/react-helpers';
import type { ApolloError } from '@apollo/client';

export function isValidPartyId(rawId: string) {
  const id = (rawId = remove0x(rawId));
  return id.length === 64;
}

type PartyIdErrorProps = {
  id: string;
  error: ApolloError;
};

const PartyIdError = ({ id, error }: PartyIdErrorProps) => {
  const end = isValidPartyId(id)
    ? t('No accounts or transactions found for: ')
    : 'Invalid party id: ';
  return (
    <section>
      <p>
        {end} <code>{id}</code>
      </p>
    </section>
  );
};

export default PartyIdError;
