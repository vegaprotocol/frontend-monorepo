import type { Proposal } from './tx-proposal';
import { proposalRequiresSignatureBundle } from './tx-proposal';

describe('proposalRequiresSignatureBundle', () => {
  it('should return false for freeform proposals, which do not require a signature bundle to enact', () => {
    const mock = {
      terms: {
        newFreeform: {},
      },
    };

    expect(proposalRequiresSignatureBundle(mock)).toEqual(false);
  });

  it('should return false for newMarket proposals, which do not require a signature bundle to enact', () => {
    const mock = {
      terms: {
        newMarket: {},
      },
    };

    expect(proposalRequiresSignatureBundle(mock)).toEqual(false);
  });

  it('should return true for newAsset proposals, which do require a signature bundle to enact', () => {
    const mock = {
      terms: {
        newAsset: {},
      },
    };

    expect(proposalRequiresSignatureBundle(mock)).toEqual(true);
  });

  it('should return true for updateAsset proposals, which do require a signature bundle to enact', () => {
    const mock = {
      terms: {
        updateAsset: {},
      },
    };

    expect(proposalRequiresSignatureBundle(mock)).toEqual(true);
  });

  it('should return false when bad data is supplied', () => {
    expect(
      proposalRequiresSignatureBundle(false as unknown as Proposal)
    ).toEqual(false);
    expect(
      proposalRequiresSignatureBundle(undefined as unknown as Proposal)
    ).toEqual(false);
    expect(
      proposalRequiresSignatureBundle({ test: false } as unknown as Proposal)
    ).toEqual(false);
  });
});
