import { useVegaWallet } from '@vegaprotocol/wallet';
import { RainbowButton } from './buttons';
import { useState } from 'react';
import classNames from 'classnames';

export const CreateCodeForm = () => {
  const [err, setErr] = useState<boolean | null>(null);
  const { isReadOnly, pubKey } = useVegaWallet();
  const onSubmit = () => {
    // TODO: TX HERE
    if (isReadOnly || !pubKey) {
      setErr(true);
    } else {
      setErr(false);
    }
  };

  const btn = (
    <RainbowButton
      className={classNames({
        'animate-shake': err,
      })}
      variant="border"
      onClick={() => onSubmit()}
    >
      Create a referral code
    </RainbowButton>
  );

  return (
    <div className="w-1/2 mx-auto">
      <h3 className="text-xl mb-5 text-center uppercase calt">
        Create a referral code
      </h3>
      <p className="mb-6 text-center">
        Generate a referral code to share with your friends and start earning
        commission.
      </p>
      <div className="text-center">{btn}</div>
    </div>
  );
};
