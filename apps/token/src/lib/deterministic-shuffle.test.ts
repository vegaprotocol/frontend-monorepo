import {
  stringTo32BitHash,
  createRandomGenerator,
  deterministicShuffle,
} from './deterministic-shuffle';

it('Converts a string to a hash as expected', () => {
  expect(stringTo32BitHash('test')).toEqual(1706);
  expect(stringTo32BitHash('0x0ddba11')).toEqual(31040);
  expect(stringTo32BitHash('Rhosllannerchrugog')).toEqual(27853302);
});

it('Random generator is deterministic by seed: matching output', () => {
  const genSeedOne = createRandomGenerator(1);
  const anotherGenSeedOne = createRandomGenerator(1);

  expect(genSeedOne()).toEqual(anotherGenSeedOne());
  expect(genSeedOne()).toEqual(anotherGenSeedOne());
  expect(genSeedOne()).toEqual(anotherGenSeedOne());

  // Throw a result away so they are out of step
  genSeedOne();

  expect(genSeedOne()).not.toEqual(anotherGenSeedOne());
});

it('Random generator is deterministic by seed: non-matching output', () => {
  const genSeedOne = createRandomGenerator(1);
  const genSeedTwo = createRandomGenerator(2);

  expect(genSeedOne()).not.toEqual(genSeedTwo());
  expect(genSeedOne()).not.toEqual(genSeedTwo());
  expect(genSeedOne()).not.toEqual(genSeedTwo());
});

it('Random generator is deterministic by seed: switching seed overrides original seed and produces deterministic output', () => {
  const genSeedOne = createRandomGenerator(1);
  const genSeedTwo = createRandomGenerator(2);

  const firstTwoSeed = genSeedTwo();
  expect(genSeedOne()).not.toEqual(firstTwoSeed);

  const secondTwoSeed = genSeedTwo();
  expect(genSeedOne()).not.toEqual(secondTwoSeed);

  expect(genSeedOne(2)).toEqual(firstTwoSeed);
  expect(genSeedOne()).toEqual(secondTwoSeed);
});

it('deterministicShuffle shuffles deterministically: strings', () => {
  const defaultInputStrings = ['one', 'two', 'three', 'four', 'five'];
  const testSeedOne = deterministicShuffle('test', defaultInputStrings);
  const testSeedTwo = deterministicShuffle('test', defaultInputStrings);
  const testSeedThree = deterministicShuffle('test', defaultInputStrings);

  expect(testSeedOne).toEqual(['three', 'four', 'one', 'two', 'five']);
  expect(testSeedTwo).not.toEqual(testSeedOne);
  expect(testSeedThree).not.toEqual(testSeedOne);

  const altSeedOne = deterministicShuffle(
    'anything-except-test',
    defaultInputStrings
  );
  expect(altSeedOne).not.toEqual(testSeedOne);
});

it('deterministicShuffle shuffles deterministically: numbers', () => {
  const defaultInputNumbers = [1, 2, 3, 4, 5];
  const testSeedOne = deterministicShuffle('test', defaultInputNumbers);
  const testSeedTwo = deterministicShuffle('test', defaultInputNumbers);
  const testSeedThree = deterministicShuffle('test', defaultInputNumbers);

  expect(testSeedOne).toEqual([3, 4, 1, 2, 5]);
  expect(testSeedTwo).not.toEqual(testSeedOne);
  expect(testSeedThree).not.toEqual(testSeedOne);

  const altSeedOne = deterministicShuffle(
    'anything-except-test',
    defaultInputNumbers
  );
  expect(altSeedOne).not.toEqual(testSeedOne);
});

it('deterministicShuffle shuffles deterministically: objects', () => {
  const defaultInputObjects = [
    { test: 1 },
    { test: 2 },
    { test: 3 },
    { test: 4 },
    { test: 5 },
  ];
  const testSeedOne = deterministicShuffle('test', defaultInputObjects);
  const testSeedTwo = deterministicShuffle('test', defaultInputObjects);
  const testSeedThree = deterministicShuffle('test', defaultInputObjects);

  expect(testSeedOne).toEqual([
    { test: 3 },
    { test: 4 },
    { test: 1 },
    { test: 2 },
    { test: 5 },
  ]);
  expect(testSeedTwo).not.toEqual(testSeedOne);
  expect(testSeedThree).not.toEqual(testSeedOne);

  const altSeedOne = deterministicShuffle(
    'anything-except-test',
    defaultInputObjects
  );
  expect(altSeedOne).not.toEqual(testSeedOne);
});
