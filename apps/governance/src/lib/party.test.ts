import type { ApolloError } from '@apollo/client';
import {
  PARTY_NOT_FOUND,
  filterAcceptableGraphqlErrors,
  isPartyNotFoundError,
} from './party';
import type { GraphQLError } from 'graphql';

/**
 *
 * @param message
 * @returns GraphQLError
 */
function createMockApolloErrors(message: string): GraphQLError {
  return {
    message,
    extensions: {
      code: message.toUpperCase().replace(/ /g, '_'),
    },
    locations: [],
    originalError: new Error(message),
    path: [],
    nodes: [],
    positions: [1],
    name: message,
    source: {
      body: message,
      name: message,
      locationOffset: {
        line: 1,
        column: 1,
      },
    },
  };
}

describe('filterAcceptableGraphqlErrors', () => {
  it('should return undefined if the error is a party not found error', () => {
    const error: Partial<ApolloError> = {
      graphQLErrors: [createMockApolloErrors('failed to get party for ID')],
    };

    const result = filterAcceptableGraphqlErrors(error as ApolloError);

    expect(result).toBeUndefined();
  });

  it('should return the error if it is not a party not found error', () => {
    const error: Partial<ApolloError> = {
      graphQLErrors: [createMockApolloErrors('Some other error')],
    };

    const result = filterAcceptableGraphqlErrors(error as ApolloError);

    expect(result).toEqual(error);
  });

  it('should return the error if there are multiple errors', () => {
    const error: Partial<ApolloError> = {
      graphQLErrors: [
        createMockApolloErrors('failed to get party for ID'),
        createMockApolloErrors('Some other error'),
      ],
    };

    const result = filterAcceptableGraphqlErrors(error as ApolloError);

    expect(result).toEqual(error);
  });

  it('should return the error if there are no errors', () => {
    const error: Partial<ApolloError> = {
      graphQLErrors: [],
    };

    const result = filterAcceptableGraphqlErrors(error as ApolloError);

    expect(result).toEqual(error);
  });

  it('should return undefined if the error is undefined', () => {
    const result = filterAcceptableGraphqlErrors(undefined);

    expect(result).toBeUndefined();
  });
});

describe('isPartyNotFoundError', () => {
  it('should return true if the error message includes PARTY_NOT_FOUND', () => {
    const error = { message: 'failed to get party for ID' };

    const result = isPartyNotFoundError(error);

    expect(result).toBe(true);
  });

  it('should return false if the error message does not include PARTY_NOT_FOUND', () => {
    const error = { message: 'Some other error' };

    const result = isPartyNotFoundError(error);

    expect(result).toBe(false);
  });

  // Will trip if the error message changes, which should not be a problem, but there
  // might be logic that depends on it
  it('expects party not found error to remain consistent', () => {
    const error = 'failed to get party for ID';

    expect(PARTY_NOT_FOUND).toStrictEqual(error);
  });
});
