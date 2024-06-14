import { format, getDate } from './proposal-date';
import type { Proposal } from './proposal-date';

describe('format', () => {
  it('returns default value if date is undefined', () => {
    const def = 'Default';
    const result = format(undefined, def);
    expect(result).toBe(def);
  });

  it('returns formatted date if date is valid', () => {
    const date = '1631232000';
    const def = 'Default';
    const result = format(date, def);
    expect(result).toContain('2021');
    expect(result).toContain('10');
  });

  it('returns default value if date is invalid', () => {
    const date = 'invalid';
    const def = 'Default';
    const result = format(date, def);
    expect(result).toBe(def);
  });
});

describe('getDate', () => {
  const terms = {
    closingTimestamp: '1631232000',
    enactmentTimestamp: '1631232000',
    validationTimestamp: '1631232000',
  };

  it('returns default value if proposal state is undefined', () => {
    const proposal = undefined;
    const result = getDate(proposal, terms);
    expect(result).toBe('Unknown');
  });

  it('returns formatted date for STATE_DECLINED', () => {
    const proposal = { state: 'STATE_DECLINED' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toContain('Rejected on:');
    expect(result).toContain('2021');
  });

  it('returns formatted date for STATE_ENACTED', () => {
    const proposal = { state: 'STATE_ENACTED' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toContain('Vote passed on:');
    expect(result).toContain('2021');
  });

  it('returns formatted date for STATE_FAILED', () => {
    const proposal = { state: 'STATE_FAILED' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toContain('Failed on:');
    expect(result).toContain('2021');
  });

  it('returns formatted date for STATE_OPEN', () => {
    const proposal = { state: 'STATE_OPEN' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toContain('Open until:');
    expect(result).toContain('2021');
  });

  it('returns formatted date for STATE_PASSED', () => {
    const proposal = { state: 'STATE_PASSED' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toContain('Passed on:');
    expect(result).toContain('2021');
  });

  it('returns default value for STATE_REJECTED', () => {
    const proposal = { state: 'STATE_REJECTED' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toBe('Rejected on submission');
  });

  it('returns default value for STATE_WAITING_FOR_NODE_VOTE', () => {
    const proposal = { state: 'STATE_WAITING_FOR_NODE_VOTE' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toBe('Opening...');
  });

  it('returns default value for unknown state', () => {
    const proposal = { state: 'UNKNOWN_STATE' };
    const result = getDate(proposal as Proposal, terms);
    expect(result).toBe('Unknown');
  });
});
