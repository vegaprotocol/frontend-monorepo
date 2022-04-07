import { ethers } from "ethers";
import { SHA3 } from "sha3";

export const sigToId = (sig: string) => {
  // Prepend 0x
  if (sig.slice(0, 2) !== "0x") {
    sig = "0x" + sig;
  }

  // Create the ID
  const hash = new SHA3(256);
  const bytes = ethers.utils.arrayify(sig);
  hash.update(Buffer.from(bytes));
  const id = ethers.utils.hexlify(hash.digest());

  // Remove 0x as core doesn't keep them in the API
  return id.substring(2);
};
