import type { ApolloError } from '@apollo/client';
import type { GraphQLErrors } from '@apollo/client/errors';

const NOT_FOUND = 'NotFound';

const isApolloGraphQLError = (
  error: ApolloError | Error | undefined
): error is ApolloError => {
  return !!error && !!(error as ApolloError).graphQLErrors;
};

const hasNotFoundGraphQLErrors = (errors: GraphQLErrors) => {
  return errors.some((e) => e.extensions && e.extensions['type'] === NOT_FOUND);
};

export const isNotFoundGraphQLError = (
  error: Error | ApolloError | undefined
) => {
  return (
    isApolloGraphQLError(error) && hasNotFoundGraphQLErrors(error.graphQLErrors)
  );
};
