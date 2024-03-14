import {
  type DispatchStrategy,
  type TransferNode,
  EntityScope,
  type TransferKind,
  TransferStatus,
  IndividualScope,
} from '@vegaprotocol/types';
import {
  type RewardTransfer,
  isActiveReward,
  isReward,
  isScopedToTeams,
} from './use-rewards';

const makeDispatchStrategy = (
  entityScope: EntityScope,
  individualScope?: IndividualScope
): DispatchStrategy =>
  ({
    entityScope,
    individualScope,
  } as DispatchStrategy);

const makeReward = (
  status: TransferStatus,
  startEpoch: number,
  endEpoch?: number,
  dispatchStrategy?: DispatchStrategy,
  kind: TransferKind['__typename'] = 'OneOffTransfer'
): RewardTransfer =>
  ({
    transfer: {
      status,
      kind: {
        __typename: kind,
        dispatchStrategy,
        startEpoch,
        endEpoch,
      },
    },
  } as RewardTransfer);

describe('isReward', () => {
  it.each([
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_INDIVIDUALS),
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        undefined,
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'OneOffTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_INDIVIDUALS),
        'OneOffTransfer'
      ),
      false,
    ],
  ])('checks if given transfer is a reward or not', (input, output) => {
    expect(isReward(input as TransferNode)).toEqual(output);
  });
});

describe('isActiveReward', () => {
  it.each([
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        2,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        3,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        4, // start in 1 epoch
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_DONE, // done, not active any more
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        2, // ended 1 epoch ago
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        3, // ends now, but active until end of epoch
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS),
        'RecurringTransfer'
      ),
      true,
    ],
  ])('checks if given reward is active or not', (input, output) => {
    expect(isActiveReward(input, 3)).toEqual(output);
  });
});

describe('isScopedToTeams', () => {
  it.each([
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_TEAMS), // only teams
        'RecurringTransfer'
      ),
      true,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(
          EntityScope.ENTITY_SCOPE_INDIVIDUALS,
          IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM // individual in teams but not a team game
        ),
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(EntityScope.ENTITY_SCOPE_INDIVIDUALS), // not in team
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(
          EntityScope.ENTITY_SCOPE_INDIVIDUALS,
          IndividualScope.INDIVIDUAL_SCOPE_ALL // not only in team
        ),
        'RecurringTransfer'
      ),
      false,
    ],
    [
      makeReward(
        TransferStatus.STATUS_PENDING,
        1,
        undefined,
        makeDispatchStrategy(
          EntityScope.ENTITY_SCOPE_INDIVIDUALS,
          IndividualScope.INDIVIDUAL_SCOPE_NOT_IN_TEAM // not in team
        ),
        'RecurringTransfer'
      ),
      false,
    ],
  ])('checks if given reward is scoped to teams or not', (input, output) => {
    expect(isScopedToTeams(input)).toEqual(output);
  });
});
