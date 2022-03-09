import { includesLeftPadding, includesRightPadding } from './class-names';

test('includesLeftPadding detects class name which affects left padding', () => {
  expect(includesLeftPadding()).toEqual(false);
  expect(includesLeftPadding('')).toEqual(false);
  expect(includesLeftPadding('pl-8')).toEqual(true);
  expect(includesLeftPadding('pl-16')).toEqual(true);
  expect(includesLeftPadding(' pl-16')).toEqual(true);
  expect(includesLeftPadding('prepend pl-8')).toEqual(true);
  expect(includesLeftPadding('pl-16 ')).toEqual(true);
  expect(includesLeftPadding('pl-16 append')).toEqual(true);
  expect(includesLeftPadding('px-8')).toEqual(true);
  expect(includesLeftPadding('px-16')).toEqual(true);
  expect(includesLeftPadding(' px-16')).toEqual(true);
  expect(includesLeftPadding('prepend px-8')).toEqual(true);
  expect(includesLeftPadding('px-16 ')).toEqual(true);
  expect(includesLeftPadding('px-16 append')).toEqual(true);
  expect(includesLeftPadding('px-16a')).toEqual(false);
  expect(includesLeftPadding('apx-16')).toEqual(false);
});

test('includesRightPadding detects class name which affects right padding', () => {
  expect(includesRightPadding()).toEqual(false);
  expect(includesRightPadding('')).toEqual(false);
  expect(includesRightPadding('pr-8')).toEqual(true);
  expect(includesRightPadding('pr-16')).toEqual(true);
  expect(includesRightPadding(' pr-16')).toEqual(true);
  expect(includesRightPadding('prepend pr-8')).toEqual(true);
  expect(includesRightPadding('pr-16 ')).toEqual(true);
  expect(includesRightPadding('pr-16 append')).toEqual(true);
  expect(includesRightPadding('px-8')).toEqual(true);
  expect(includesRightPadding('px-16')).toEqual(true);
  expect(includesRightPadding(' px-16')).toEqual(true);
  expect(includesRightPadding('prepend px-8')).toEqual(true);
  expect(includesRightPadding('px-16 ')).toEqual(true);
  expect(includesRightPadding('px-16 append')).toEqual(true);
  expect(includesRightPadding('px-16a')).toEqual(false);
  expect(includesRightPadding('apx-16')).toEqual(false);
});
