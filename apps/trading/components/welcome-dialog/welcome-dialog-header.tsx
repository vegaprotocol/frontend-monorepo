import { Networks, useEnvironment } from '@vegaprotocol/environment';
import * as constants from '../constants';

export const WelcomeDialogHeader = () => {
  const { VEGA_ENV } = useEnvironment();
  const header =
    VEGA_ENV === Networks.MAINNET
      ? constants.MAINNET_WELCOME_HEADER
      : constants.TESTNET_WELCOME_HEADER;
  return <h1 className="mb-6 p-4 text-center text-2xl">{header}</h1>;
};
