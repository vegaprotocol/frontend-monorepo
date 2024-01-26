type Batch = { __typename?: 'BatchProposal' | undefined } | null | undefined;
type Single = { __typename?: 'Proposal' | undefined } | null | undefined;
export type SingleProposal<T extends Batch | Single> = Extract<
  T,
  { __typename?: 'Proposal' }
>;
