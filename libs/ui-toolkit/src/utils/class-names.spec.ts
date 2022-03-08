import { paddingLeftProvided, paddingRightProvided } from './class-names';

test('paddingLeftProvided detects class name which affects left padding', () => {
  expect(paddingLeftProvided()).toEqual(false);
  expect(paddingLeftProvided('')).toEqual(false);
  expect(paddingLeftProvided('pl-8')).toEqual(true);
  expect(paddingLeftProvided('pl-16')).toEqual(true);
  expect(paddingLeftProvided(' pl-16')).toEqual(true);
  expect(paddingLeftProvided('prepend pl-8')).toEqual(true);
  expect(paddingLeftProvided('pl-16 ')).toEqual(true);
  expect(paddingLeftProvided('pl-16 append')).toEqual(true);
  expect(paddingLeftProvided('px-8')).toEqual(true);
  expect(paddingLeftProvided('px-16')).toEqual(true);
  expect(paddingLeftProvided(' px-16')).toEqual(true);
  expect(paddingLeftProvided('prepend px-8')).toEqual(true);
  expect(paddingLeftProvided('px-16 ')).toEqual(true);
  expect(paddingLeftProvided('px-16 append')).toEqual(true);
  expect(paddingLeftProvided('px-16a')).toEqual(false);
  expect(paddingLeftProvided('apx-16')).toEqual(false);
});

test('paddingRightProvided detects class name which affects right padding', () => {
  expect(paddingRightProvided()).toEqual(false);
  expect(paddingRightProvided('')).toEqual(false);
  expect(paddingRightProvided('pr-8')).toEqual(true);
  expect(paddingRightProvided('pr-16')).toEqual(true);
  expect(paddingRightProvided(' pr-16')).toEqual(true);
  expect(paddingRightProvided('prepend pr-8')).toEqual(true);
  expect(paddingRightProvided('pr-16 ')).toEqual(true);
  expect(paddingRightProvided('pr-16 append')).toEqual(true);
  expect(paddingRightProvided('px-8')).toEqual(true);
  expect(paddingRightProvided('px-16')).toEqual(true);
  expect(paddingRightProvided(' px-16')).toEqual(true);
  expect(paddingRightProvided('prepend px-8')).toEqual(true);
  expect(paddingRightProvided('px-16 ')).toEqual(true);
  expect(paddingRightProvided('px-16 append')).toEqual(true);
  expect(paddingRightProvided('px-16a')).toEqual(false);
  expect(paddingRightProvided('apx-16')).toEqual(false);
});
