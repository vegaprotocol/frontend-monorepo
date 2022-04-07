import { VoteValue } from "../../__generated__/globalTypes";
import { VegaKey } from "../../contexts/app-state/app-state-context";
import { VOTE_VALUE_MAP } from "../../routes/governance/components/vote-details";
import { LocalStorage } from "../storage";
import { GenericErrorResponse } from "./vega-wallet-types";

export const MINIMUM_WALLET_VERSION =
  process.env.REACT_APP_SUPPORTED_WALLET_VERSION;

export const DEFAULT_WALLET_URL = "http://localhost:1789";
export const HOSTED_WALLET_URL = "https://wallet.testnet.vega.xyz";
const TOKEN_STORAGE_KEY = "vega_wallet_token";
const WALLET_URL_KEY = "vega_wallet_url";
const KEY_STORAGE_KEY = "vega_wallet_key";

const Endpoints = {
  STATUS: "status",
  TOKEN: "auth/token",
  KEYS: "keys",
  COMMAND: "command/sync",
  VERSION: "version",
};

export const Errors = {
  NO_TOKEN: "No token",
  SERVICE_UNAVAILABLE: "Wallet service unavailable",
  SESSION_EXPIRED: "Session expired",
  INVALID_CREDENTIALS: "Invalid credentials",
  COMMAND_FAILED: "Command failed",
  INVALID_URL: "Invalid wallet URL",
};

export interface DelegateSubmissionInput {
  pubKey: string;
  delegateSubmission: {
    nodeId: string;
    amount: string;
  };
}

export interface UndelegateSubmissionInput {
  pubKey: string;
  undelegateSubmission: {
    nodeId: string;
    amount: string;
    method: "METHOD_NOW" | "METHOD_AT_END_OF_EPOCH";
  };
}

export interface VoteSubmissionInput {
  pubKey: string;
  voteSubmission: {
    value: typeof VOTE_VALUE_MAP[VoteValue];
    proposalId: string;
  };
}

export interface WithdrawSubmissionInput {
  pubKey: string;
  withdrawSubmission: {
    amount: string;
    asset: string;
    ext: {
      erc20: {
        receiverAddress: string;
      };
    };
  };
}

export type CommandSyncInput =
  | DelegateSubmissionInput
  | UndelegateSubmissionInput
  | VoteSubmissionInput
  | WithdrawSubmissionInput;

export interface CommandSyncResponse {
  inputData: string;
  pubKey: string;
  signature: {
    algo: string;
    value: string;
    version: number;
  };
  version: number;
}

export interface IVegaWalletService {
  url: string;
  token: string;
  statusPoll: any;
  getToken(params: {
    wallet: string;
    passphrase: string;
  }): Promise<[string | undefined, string | undefined]>;
  revokeToken(): Promise<[string | undefined, boolean]>;
  getKeys(): Promise<[string | undefined, VegaKey[] | undefined]>;
}

export class VegaWalletService implements IVegaWalletService {
  version: number;
  url: string;
  token: string;
  statusPoll: any;
  key: string;

  constructor() {
    this.version = 1;
    this.url = LocalStorage.getItem(WALLET_URL_KEY) || DEFAULT_WALLET_URL;
    this.token = LocalStorage.getItem(TOKEN_STORAGE_KEY) || "";
    this.key = LocalStorage.getItem(KEY_STORAGE_KEY) || "";
  }

  async getToken(params: {
    wallet: string;
    passphrase: string;
    url: string;
  }): Promise<[string | undefined, string | undefined]> {
    const urlValid = this.validateUrl(params.url);

    if (urlValid) {
      this.setWalletUrl(params.url);
    } else {
      return [Errors.INVALID_URL, undefined];
    }

    try {
      const res = await fetch(`${this.getUrl()}/${Endpoints.TOKEN}`, {
        method: "post",
        body: JSON.stringify(params),
      });
      const json = await res.json();

      if (json.hasOwnProperty("token")) {
        this.setToken(json.token);
        return [undefined, json.token];
      } else {
        return [Errors.INVALID_CREDENTIALS, undefined];
      }
    } catch (err) {
      return this.handleServiceUnavailable();
    }
  }

  async revokeToken(): Promise<[string | undefined, boolean]> {
    if (!this.token) {
      return [Errors.NO_TOKEN, false];
    }

    try {
      const res = await fetch(`${this.getUrl()}/${Endpoints.TOKEN}`, {
        method: "delete",
        headers: { authorization: `Bearer ${this.token}` },
      });
      const json = await res.json();

      if (json.success) {
        this.clearKey();
        this.clearToken();
        this.clearWalletUrl();
        return [undefined, true];
      } else {
        return [undefined, false];
      }
    } catch (err) {
      return this.handleServiceUnavailable(false);
    }
  }

  async getKeys(): Promise<[string | undefined, VegaKey[] | undefined]> {
    if (!this.token) {
      return [Errors.NO_TOKEN, undefined];
    }

    try {
      const res = await fetch(`${this.getUrl()}/${Endpoints.KEYS}`, {
        headers: { authorization: `Bearer ${this.token}` },
      });

      const err = this.verifyResponse(res);

      if (err) {
        return [err, undefined];
      }

      const json = await res.json();

      return [undefined, json.keys];
    } catch (err) {
      return this.handleServiceUnavailable();
    }
  }

  async commandSync(
    body: CommandSyncInput
  ): Promise<[string | undefined, CommandSyncResponse | undefined]> {
    if (!this.token) {
      return [Errors.NO_TOKEN, undefined];
    }

    try {
      const res = await fetch(`${this.getUrl()}/${Endpoints.COMMAND}`, {
        method: "post",
        body: JSON.stringify({
          ...body,
          propagate: true,
        }),
        headers: { authorization: `Bearer ${this.token}` },
      });

      const err = this.verifyResponse(res);

      if (err) {
        return [err, undefined];
      }

      const json = await res.json();

      if ("errors" in json) {
        return [Errors.COMMAND_FAILED, undefined];
      } else {
        return [undefined, json];
      }
    } catch (err) {
      return this.handleServiceUnavailable();
    }
  }

  setKey(key: string) {
    this.key = key;
    LocalStorage.setItem(KEY_STORAGE_KEY, key);
  }

  private clearKey() {
    this.key = "";
    LocalStorage.removeItem(KEY_STORAGE_KEY);
  }

  private setToken(token: string) {
    this.token = token;
    LocalStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  private clearToken() {
    this.token = "";
    LocalStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private setWalletUrl(url: string) {
    this.url = url;
    LocalStorage.setItem(WALLET_URL_KEY, url);
  }

  private clearWalletUrl() {
    this.url = DEFAULT_WALLET_URL;
    LocalStorage.removeItem(WALLET_URL_KEY);
  }

  private getUrl() {
    return `${this.url}/api/v${this.version}`;
  }

  private handleServiceUnavailable(returnVal?: any): [string, any] {
    this.clearWalletUrl();
    return [Errors.SERVICE_UNAVAILABLE, returnVal];
  }

  private validateUrl(url: string) {
    try {
      new URL(url);
    } catch (err) {
      return false;
    }
    return true;
  }

  /**
   * Parses the response object to either return an error string or null if
   * everything looks good. Clears token 403 response returned
   */
  private verifyResponse(res: Response): string | null {
    if (res.status === 403) {
      this.clearToken();
      return Errors.SESSION_EXPIRED;
    } else if (!res.ok) {
      return Errors.COMMAND_FAILED;
    }

    return null;
  }
}

export function hasErrorProperty(obj: unknown): obj is GenericErrorResponse {
  if (
    (obj as GenericErrorResponse).error !== undefined &&
    typeof (obj as GenericErrorResponse).error === "string"
  ) {
    return true;
  }

  return false;
}

export const vegaWalletService = new VegaWalletService();
