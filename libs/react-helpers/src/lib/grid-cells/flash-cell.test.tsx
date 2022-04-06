import { findFirstDiffPos } from './flash-cell';

describe('findFirstDiffPos', () => {
  it('Returns -1 for matching strings', () => {
    const a = 'test';
    const b = 'test';

    expect(findFirstDiffPos(a, b)).toEqual(-1);
  });

  it('Returns -1 if a string is undefined (just in case)', () => {
    const a = 'test';
    // eslint-disable-next-line
    const b = undefined as any as string;

    expect(findFirstDiffPos(a, b)).toEqual(-1);
    expect(findFirstDiffPos(b, a)).toEqual(-1);
  });

  it('Returns -1 if one string is empty', () => {
    const a = 'test';
    const b = '';

    expect(findFirstDiffPos(a, b)).toEqual(-1);
    expect(findFirstDiffPos(b, a)).toEqual(-1);
  });

  it('Happy path', () => {
    const a = 'test';

    expect(findFirstDiffPos(a, 'test')).toEqual(-1);
    expect(findFirstDiffPos(a, '!est')).toEqual(0);
    expect(findFirstDiffPos(a, 't!st')).toEqual(1);
  });
});
