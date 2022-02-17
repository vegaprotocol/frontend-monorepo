/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Guess
// ====================================================

export interface Guess_party {
  __typename: 'Party';
  /**
   * Party identifier
   */
  id: string;
}

export interface Guess_market {
  __typename: 'Market';
  /**
   * Market ID
   */
  id: string;
}

export interface Guess {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Guess_party | null;
  /**
   * An instrument that is trading on the VEGA network
   */
  market: Guess_market | null;
}

export interface GuessVariables {
  guess: string;
}
