import {
  useVegaWallet,
  useVegaWalletDialogStore,
  determineId,
} from '@vegaprotocol/wallet';
import { RainbowButton } from './buttons';
import { useState } from 'react';
import {
  CopyWithTooltip,
  Dialog,
  ExternalLink,
  InputError,
  Intent,
  TradingAnchorButton,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';
import { useStakeAvailable } from './hooks/use-stake-available';
import {
  ABOUT_REFERRAL_DOCS_LINK,
  DISCLAIMER_REFERRAL_DOCS_LINK,
} from './constants';
import { useReferral } from './hooks/use-referral';

export const CreateCodeContainer = () => {
  return <CreateCodeForm />;
};

export const CreateCodeForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { pubKey, isReadOnly } = useVegaWallet();

  return (
    <div className="w-2/3 max-w-md mx-auto bg-vega-clight-800 dark:bg-vega-cdark-800 p-8 rounded-lg">
      <h3 className="mb-4 text-2xl text-center calt">Create a referral code</h3>
      <p className="mb-4 text-center text-base">
        Generate a referral code to share with your friends and start earning
        commission.
      </p>

      <div className="w-full flex flex-col">
        <RainbowButton
          variant="border"
          disabled={isReadOnly}
          onClick={() => {
            if (pubKey) {
              setDialogOpen(true);
            } else {
              openWalletDialog();
            }
          }}
        >
          {pubKey ? 'Create a referral code' : 'Connect wallet'}
        </RainbowButton>
      </div>

      <Dialog
        title="Create a referral code"
        open={dialogOpen}
        onChange={() => setDialogOpen(false)}
        size="small"
      >
        <CreateCodeDialog setDialogOpen={setDialogOpen} />
      </Dialog>
    </div>
  );
};

const CreateCodeDialog = ({
  setDialogOpen,
}: {
  setDialogOpen: (open: boolean) => void;
}) => {
  const createLink = useLinks(DApp.Governance);
  const { isReadOnly, pubKey, sendTx } = useVegaWallet();
  const { refetch } = useReferral({ pubKey, role: 'referrer' });
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const { stakeAvailable: currentStakeAvailable, requiredStake } =
    useStakeAvailable();

  const onSubmit = () => {
    if (isReadOnly || !pubKey) {
      setErr('Not connected');
    } else {
      setErr(null);
      setStatus('loading');
      setCode(null);
      sendTx(pubKey, {
        createReferralSet: {
          isTeam: false,
        },
      })
        .then((res) => {
          if (!res) {
            setErr(`Invalid response: ${JSON.stringify(res)}`);
            return;
          }
          const code = determineId(res.signature);
          setCode(code);
          setStatus('success');
        })
        .catch((err) => {
          if (err.message.includes('user rejected')) {
            setStatus('idle');
            return;
          }
          setStatus('error');
          setErr(err.message);
        });
    }
  };

  const getButtonProps = () => {
    if (status === 'idle' || status === 'error') {
      return {
        children: 'Generate code',
        onClick: () => onSubmit(),
      };
    }

    if (status === 'loading') {
      return {
        children: 'Confirm in wallet...',
        disabled: true,
      };
    }

    if (status === 'success') {
      return {
        children: 'Close',
        intent: Intent.Success,
        onClick: () => {
          refetch();
          setDialogOpen(false);
        },
      };
    }
  };

  if (!pubKey || currentStakeAvailable == null || requiredStake == null) {
    return (
      <div className="flex flex-col gap-4">
        <p>You must be connected to the Vega wallet.</p>
        <TradingButton
          intent={Intent.Primary}
          onClick={() => setDialogOpen(false)}
        >
          Close
        </TradingButton>
      </div>
    );
  }

  if (currentStakeAvailable < requiredStake) {
    return (
      <div className="flex flex-col gap-4">
        <p>
          You need at least{' '}
          {addDecimalsFormatNumber(requiredStake.toString(), 18)} VEGA staked to
          generate a referral code and participate in the referral program.
        </p>
        <TradingAnchorButton
          href={createLink(TokenStaticLinks.ASSOCIATE)}
          intent={Intent.Primary}
          target="_blank"
        >
          Stake some $VEGA now
        </TradingAnchorButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {(status === 'idle' || status === 'loading' || status === 'error') && (
        <p>
          Generate a referral code to share with your friends and start earning
          commission.
        </p>
      )}
      {status === 'success' && code && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 p-2 text-sm rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
            <p className="overflow-hidden whitespace-nowrap text-ellipsis">
              {code}
            </p>
          </div>
          <CopyWithTooltip text={code}>
            <TradingButton
              className="text-sm no-underline"
              icon={<VegaIcon name={VegaIconNames.COPY} />}
            >
              <span>Copy</span>
            </TradingButton>
          </CopyWithTooltip>
        </div>
      )}
      <TradingButton
        fill={true}
        intent={Intent.Primary}
        {...getButtonProps()}
      />
      {err && <InputError>{err}</InputError>}
      <div className="flex justify-center pt-5 mt-2 text-sm border-t gap-4 text-default border-default">
        <ExternalLink href={ABOUT_REFERRAL_DOCS_LINK}>
          About the referral program
        </ExternalLink>
        <ExternalLink href={DISCLAIMER_REFERRAL_DOCS_LINK}>
          Disclaimer
        </ExternalLink>
      </div>
    </div>
  );
};
