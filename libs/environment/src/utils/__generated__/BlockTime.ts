/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: BlockTime
// ====================================================

export interface BlockTime_busEvents {
  __typename: "BusEvent";
  /**
   * the ID for this event
   */
  id: string;
}

export interface BlockTime {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: BlockTime_busEvents[] | null;
}
