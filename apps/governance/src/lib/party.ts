import type { ApolloError } from '@apollo/client';

export const PARTY_NOT_FOUND = 'failed to get party for ID';

export const isPartyNotFoundError = (error: { message: string }) => {
  if (error.message.includes(PARTY_NOT_FOUND)) {
    return true;
  }
  return false;
};

/**
 * If a party has no accounts or data, then this GraphQL query believes it does not exist
 * Not having any rewards is a valid state, so in some cases we can filter this error out.
 *
 * @param error ApolloError | undefined
 * @returns ApolloError | undefined
 */
export function filterAcceptableGraphqlErrors(
  error?: ApolloError
): ApolloError | undefined {
  // Currently the only error we expect is when a party has no accounts
  if (error && error.graphQLErrors.length === 1) {
    if (isPartyNotFoundError(error.graphQLErrors[0])) {
      return;
    }
  }

  return error;
}
