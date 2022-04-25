import { sigToId } from "./sig-to-id";

test("creating an id from a signature", () => {
  const sig =
    "3594b7f4e1c078aaa65b3efac57e1436da64d60c2961bf432dc62daa36f8b0b2602ed9c990ee46dd8ab5181e19c19b06587f080d22fc4543c1869970e678f20f";
  const expected =
    "9ebd2c424a9426bf5f38112878eb2f99bfdf5ec17b5782b944e6be8177084327";
  expect(sigToId(sig)).toEqual(expected);
});
