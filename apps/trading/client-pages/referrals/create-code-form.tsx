import {
  useVegaWallet,
  useVegaWalletDialogStore,
  determineId,
} from '@vegaprotocol/wallet';
import { RainbowButton } from './buttons';
import { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  CopyWithTooltip,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

export const CreateCodeForm = () => {
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { isReadOnly, pubKey, sendTx } = useVegaWallet();
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

  return (
    <div className="w-1/2 mx-auto">
      <h3 className="mb-5 text-xl text-center uppercase calt">
        Create a referral code
      </h3>
      <p className="mb-6 text-center">
        Generate a referral code to share with your friends and start earning
        commission.
      </p>
      <div className="mb-5">
        {pubKey ? (
          <div className="text-center">
            <RainbowButton
              className={classNames({
                'animate-shake': err,
              })}
              variant="border"
              disabled={status === 'loading'}
              onClick={() => onSubmit()}
            >
              {status === 'loading'
                ? 'Complete in wallet'
                : 'Create a referral code'}
            </RainbowButton>
          </div>
        ) : (
          <div className="text-center">
            <RainbowButton variant="border" onClick={() => openWalletDialog()}>
              Connect wallet
            </RainbowButton>
          </div>
        )}
      </div>
      {status === 'success' && code && (
        <div className="flex gap-2">
          <pre className="p-3 text-sm rounded bg-vega-clight-700 dark:bg-vega-cdark-700">
            {code}
          </pre>
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
    </div>
  );
};
