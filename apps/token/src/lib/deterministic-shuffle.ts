// creates a random number generator function.
export function createRandomGenerator(seed: number) {
  const a = 5486230734; // some big numbers
  const b = 6908969830;
  const m = 9853205067;
  let x = seed;
  // returns a random value 0 <= num < 1
  return function (seed = x) {
    // seed is optional. If supplied sets a new seed
    x = (seed * a + b) % m;
    return x / m;
  };
}

// function creates a 32bit hash of a string
export function stringTo32BitHash(str: string) {
  let v = 0;
  for (let i = 0; i < str.length; i += 1) {
    v += str.charCodeAt(i) << i % 24;
  }
  return v % 0xffffffff;
}

// shuffle array using the str as a key.
export function deterministicShuffle(
  str: string,
  arr: Array<string | number | object>
) {
  const rArr = [];
  const random = createRandomGenerator(stringTo32BitHash(str));
  while (arr.length > 1) {
    rArr.push(arr.splice(Math.floor(random() * arr.length), 1)[0]);
  }
  rArr.push(arr[0]);
  return rArr;
}
