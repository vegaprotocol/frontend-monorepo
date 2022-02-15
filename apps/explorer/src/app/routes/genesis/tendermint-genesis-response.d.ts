export interface Block {
  max_bytes: string;
  max_gas: string;
  time_iota_ms: string;
}

export interface Evidence {
  max_age_num_blocks: string;
  max_age_duration: string;
}

export interface ValidatorAddresses {
  pub_key_types: string[];
}

export interface Version {}

export interface ConsensusParams {
  block: Block;
  evidence: Evidence;
  validator: ValidatorAddresses;
  version: Version;
}

export interface PubKey {
  type: string;
  value: string;
}

export interface Validator {
  address: string;
  pub_key: PubKey;
  power: string;
  name: string;
}

export interface Erc20 {
  contract_address: string;
}

export interface Erc20Source {
  erc20: Erc20;
}

export interface Asset {
  decimals: number;
  min_lp_stake: string;
  name: string;
  source: Erc20Source | BuiltinAssetSource;
  symbol: string;
  total_supply: string;
}

export interface BuiltinAsset {
  max_faucet_amount_mint: string;
}

export interface BuiltinAssetSource {
  builtin_asset: BuiltinAsset;
}

export interface Assets {
  [key: string]: Asset;
}

export interface Network {
  replay_attack_threshold: number;
}

export interface NetworkLimits {
  bootstrap_block_count: number;
  propose_asset_enabled: boolean;
  propose_asset_enabled_from: Date;
  propose_market_enabled: boolean;
  propose_market_enabled_from: Date;
}

export interface NetworkParameters {
  [key: string]: string;
}

export interface Validators {
  [key: string]: Validator;
}

export interface AppState {
  assets: Assets;
  network: Network;
  network_limits: NetworkLimits;
  network_parameters: NetworkParameters;
  validators: Validators;
}

export interface Genesis {
  genesis_time: Date;
  chain_id: string;
  initial_height: string;
  consensus_params: ConsensusParams;
  validators: Validator[];
  app_hash: string;
  app_state: AppState;
}

export interface Result {
  genesis: Genesis;
}

export interface TendermintGenesisResponse {
  jsonrpc: string;
  id: number;
  result: Result;
}
