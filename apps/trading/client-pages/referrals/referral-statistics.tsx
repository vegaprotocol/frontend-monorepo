import { Tile } from './tile';
import {
  CopyWithTooltip,
  Input,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Button, RainbowButton } from './buttons';

import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import type { ReferralData } from './hooks/use-referral';
import { useReferral } from './hooks/use-referral';
import { Link } from 'react-router-dom';
import { CreateCodeContainer } from './create-code-form';
import classNames from 'classnames';

const CodeTile = ({
  code,
  as,
}: {
  code: string;
  as: 'referrer' | 'referee';
}) => {
  return (
    <Tile variant="rainbow">
      <h3 className="mb-1 text-lg calt">Your referral code</h3>
      {as === 'referrer' && (
        <p className="mb-3 text-sm text-vega-clight-100 dark:text-vega-cdark-100">
          Share this code with friends
        </p>
      )}
      <div className="flex gap-2">
        <Input size={1} readOnly value={code} />
        <CopyWithTooltip text={code}>
          <Button
            className="text-sm no-underline"
            icon={<VegaIcon name={VegaIconNames.COPY} />}
          >
            <span>Copy</span>
          </Button>
        </CopyWithTooltip>
      </div>
    </Tile>
  );
};

export const ReferralStatisticsContainer = () => {
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { pubKey } = useVegaWallet();

  const { data: referee } = useReferral(pubKey, 'referee');
  const { data: referrer } = useReferral(pubKey, 'referrer');

  if (!pubKey) {
    return (
      <div className="text-center">
        <RainbowButton variant="border" onClick={() => openWalletDialog()}>
          Connect wallet
        </RainbowButton>
      </div>
    );
  }

  if (referee?.code) {
    return <Statistics data={referee} as="referee" />;
  }

  if (referrer?.code) {
    return <Statistics data={referrer} as="referrer" />;
  }

  return <CreateCodeContainer />;
};

const Statistics = ({
  data,
  as,
}: {
  data: ReferralData;
  as: 'referrer' | 'referee';
}) => {
  return (
    <div
      className={classNames('grid grid-cols-1 grid-rows-1 gap-5 mx-auto', {
        'md:w-1/2': as === 'referee',
        'md:w-2/3': as === 'referrer',
      })}
    >
      <div
        className={classNames('grid grid-rows-1 gap-5', {
          'grid-cols-2': as === 'referrer',
          'grid-cols-1': as === 'referee',
        })}
      >
        {as === 'referrer' && data?.referees && (
          <Tile className="py-3 h-full">
            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
              <h3 className="mb-1 text-6xl text-center">
                {data.referees.length}
              </h3>
              <p className="text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
                {data.referees.length === 1
                  ? 'Trader referred'
                  : 'Total traders referred'}
              </p>
            </div>
          </Tile>
        )}
        <CodeTile code={data?.code} as={as} />
      </div>
    </div>
  );
};
