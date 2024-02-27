import { ENV, Networks } from '@vegaprotocol/environment';

const TEAMS_STATS_EPOCHS_MAINNET = 30;
const TEAMS_STATS_EPOCHS_TESTNET = 192;
export const TEAMS_STATS_EPOCHS =
  ENV.VEGA_ENV === Networks.MAINNET
    ? TEAMS_STATS_EPOCHS_MAINNET
    : TEAMS_STATS_EPOCHS_TESTNET;
