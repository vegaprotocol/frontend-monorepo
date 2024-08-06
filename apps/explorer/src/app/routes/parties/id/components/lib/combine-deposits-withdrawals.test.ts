import { getDepositWithdrawalStatusLabel } from '../party-deposits-withdrawals-status-icon';
import { isDepositStatus } from './combine-deposits-withdrawals';
import { DepositStatus, WithdrawalStatus } from '@vegaprotocol/types';

describe('isDepositStatus & getDepositWithdrawalStatusLabel', () => {
  it('Use deposit status label for open, regardless of type', () => {
    expect(isDepositStatus(DepositStatus['STATUS_OPEN'])).toBe(true);
    expect(isDepositStatus(WithdrawalStatus['STATUS_OPEN'])).toBe(true);
    expect(
      getDepositWithdrawalStatusLabel(DepositStatus['STATUS_OPEN'])
    ).toEqual('Pending');
    expect(
      getDepositWithdrawalStatusLabel(WithdrawalStatus['STATUS_OPEN'])
    ).toEqual('Pending');
  });

  it('Use deposit status label for finalized, regardless of type (custom label - incomplete)', () => {
    expect(isDepositStatus(DepositStatus['STATUS_FINALIZED'])).toBe(true);
    expect(isDepositStatus(WithdrawalStatus['STATUS_FINALIZED'])).toBe(true);
    expect(
      getDepositWithdrawalStatusLabel(DepositStatus['STATUS_FINALIZED'])
    ).toEqual('Incomplete');
    expect(
      getDepositWithdrawalStatusLabel(WithdrawalStatus['STATUS_FINALIZED'])
    ).toEqual('Incomplete');
  });

  it('Use deposit status label for finalized, regardless of type (custom label - complete)', () => {
    expect(isDepositStatus(DepositStatus['STATUS_FINALIZED'])).toBe(true);
    expect(isDepositStatus(WithdrawalStatus['STATUS_FINALIZED'])).toBe(true);
    expect(
      getDepositWithdrawalStatusLabel(
        DepositStatus['STATUS_FINALIZED'],
        'fake-tx-hash'
      )
    ).toEqual('Complete');
    expect(
      getDepositWithdrawalStatusLabel(
        WithdrawalStatus['STATUS_FINALIZED'],
        'fake-tx-hash'
      )
    ).toEqual('Complete');
  });

  it('Use deposit status label for cancelled', () => {
    expect(isDepositStatus(DepositStatus['STATUS_CANCELLED'])).toBe(true);
    expect(
      getDepositWithdrawalStatusLabel(DepositStatus['STATUS_CANCELLED'])
    ).toEqual('Cancelled');
  });

  it('Use deposit status label for duplicate', () => {
    expect(isDepositStatus(DepositStatus['STATUS_DUPLICATE_REJECTED'])).toBe(
      true
    );
    expect(
      getDepositWithdrawalStatusLabel(
        DepositStatus['STATUS_DUPLICATE_REJECTED']
      )
    ).toEqual('Duplicate rejected');
  });

  it('Use withdraw status label for rejected', () => {
    expect(isDepositStatus(WithdrawalStatus['STATUS_REJECTED'])).toBe(false);
    expect(
      getDepositWithdrawalStatusLabel(WithdrawalStatus['STATUS_REJECTED'])
    ).toEqual('Rejected');
  });
});
