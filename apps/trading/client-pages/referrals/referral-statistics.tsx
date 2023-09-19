import { Tile } from './tile';
import {
  CopyWithTooltip,
  Input,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { Button, RainbowButton } from './buttons';
import { Tag } from './tag';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useReferral } from './hooks/use-referral';
import { Link } from 'react-router-dom';

export const ReferralStatistics = () => {
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { pubKey } = useVegaWallet();

  if (pubKey) {
    return <ReferralStatisticsContainer pubKey={pubKey} />;
  }

  return (
    <div className="text-center">
      <RainbowButton variant="border" onClick={() => openWalletDialog()}>
        Connect wallet
      </RainbowButton>
    </div>
  );
};

const ReferralStatisticsContainer = ({ pubKey }: { pubKey: string }) => {
  const { data } = useReferral(pubKey);

  return (
    <div className="grid grid-cols-1 grid-rows-1 gap-5">
      <div className="grid grid-cols-3 grid-rows-1 gap-5">
        <Tile>
          <h3 className="mb-1 text-4xl text-center">3</h3>
          <p className="mb-3 text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
            Your referral tier
          </p>
          <Tag className="mx-auto" color="purple">
            10,000 until Tier 2
          </Tag>
        </Tile>
        <Tile>
          <h3 className="mb-1 text-4xl text-center">0.1%</h3>
          <p className="mb-3 text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
            Your commission
          </p>
          <Tag className="mx-auto" color="purple">
            10,000 until 0.5%x
          </Tag>
        </Tile>

        {data?.code ? (
          <Tile variant="rainbow">
            <h3 className="mb-1 text-lg calt">Your referral code</h3>
            <p className="mb-3 text-sm text-vega-clight-100 dark:text-vega-cdark-100">
              Share this code with friends
            </p>
            <div className="flex gap-2">
              <Input size={1} readOnly value={data.code} />
              <CopyWithTooltip text={data.code}>
                <Button
                  className="text-sm no-underline"
                  icon={<VegaIcon name={VegaIconNames.COPY} />}
                >
                  <span>Copy</span>
                </Button>
              </CopyWithTooltip>
            </div>
          </Tile>
        ) : (
          <Tile variant="rainbow">
            <h3 className="mb-1 text-lg calt">
              Create referral code to start earning rewards
            </h3>
            <p className="mb-3 text-sm text-vega-clight-100 dark:text-vega-cdark-100">
              Invite friends and earn commission
            </p>
            <p>
              <Link to="create-code" className="underline underline-offset-4">
                Create a referral code
              </Link>
            </p>
          </Tile>
        )}
      </div>
      <div className="grid grid-cols-4 grid-rows-1 gap-5">
        <Tile className="py-3">
          <h3 className="mb-1 text-2xl text-center">10,000</h3>
          <p className="text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
            Your total trading volume
          </p>
        </Tile>
        {data?.code && (
          <Tile className="py-3">
            <h3 className="mb-1 text-2xl text-center">
              {data.referees.length}
            </h3>
            <p className="text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
              {data.referees.length === 1
                ? 'Trader referred'
                : 'Total traders referred'}
            </p>
          </Tile>
        )}
        <Tile className="py-3">
          <h3 className="mb-1 text-2xl text-center">0.1%</h3>
          <p className="text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
            Maximum trader discount
          </p>
        </Tile>
        <Tile className="py-3">
          <h3 className="mb-1 text-2xl text-center">10,000</h3>
          <p className="text-sm text-center text-vega-clight-100 dark:text-vega-cdark-100">
            Your commission (last 30d)
          </p>
        </Tile>
      </div>
    </div>
  );
};
