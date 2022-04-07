import { ExternalProvider, JsonRpcFetchFunc } from "@ethersproject/providers";
import { ethers } from "ethers";

export function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
  return new ethers.providers.Web3Provider(provider);
}
