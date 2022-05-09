import { Callout, FormGroup, Intent, Select } from '@vegaprotocol/ui-toolkit';
import { ethers } from 'ethers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Loader } from '../../components/loader';
import { StatefulButton } from '../../components/stateful-button';
import { AmountInput } from '../../components/token-input';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';
import {
  Status as WithdrawStatus,
  useCreateWithdrawal,
} from '../../hooks/use-create-withdrawal';
import { BigNumber } from '../../lib/bignumber';
import { removeDecimal } from '../../lib/decimals';
import { Routes } from '../router-config';
import type { WithdrawPage_party_accounts } from './__generated__/WithdrawPage';
import { EthAddressInput } from './eth-address-input';

interface WithdrawFormProps {
  accounts: WithdrawPage_party_accounts[];
  currVegaKey: VegaKeyExtended;
  connectedAddress: string;
}

export const WithdrawForm = ({
  accounts,
  currVegaKey,
  connectedAddress,
}: WithdrawFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [amountStr, setAmount] = React.useState('');
  const [account, setAccount] = React.useState(accounts[0]);
  const [status, submit] = useCreateWithdrawal(currVegaKey.pub);
  const [destinationAddress, setDestinationAddress] =
    React.useState(connectedAddress);
  const amount = React.useMemo(
    () => new BigNumber(amountStr || 0),
    [amountStr]
  );

  const maximum = React.useMemo(() => {
    if (account) {
      return new BigNumber(account.balanceFormatted);
    }

    return new BigNumber(0);
  }, [account]);

  const valid = React.useMemo(() => {
    if (
      !destinationAddress ||
      amount.isLessThanOrEqualTo(0) ||
      amount.isGreaterThan(maximum)
    ) {
      return false;
    }
    return true;
  }, [destinationAddress, amount, maximum]);

  const addressValid = React.useMemo(() => {
    return ethers.utils.isAddress(destinationAddress);
  }, [destinationAddress]);

  // Navigate to complete withdrawals page once withdrawal
  // creation is complete
  React.useEffect(() => {
    if (status === WithdrawStatus.Success) {
      navigate(Routes.WITHDRAWALS);
    }
  }, [status, navigate]);

  return (
    <form
      className="my-40"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || !addressValid) return;

        submit(
          removeDecimal(amount, account.asset.decimals),
          account.asset.id,
          destinationAddress
        );
      }}
    >
      <FormGroup label={t('withdrawFormAssetLabel')} labelFor="asset">
        {accounts.length ? (
          <Select
            name="asset"
            id="asset"
            onChange={(e) => {
              const account = accounts.find(
                (a) => a.asset.id === e.currentTarget.value
              );
              if (!account) throw new Error('No account');
              setAccount(account);
            }}
          >
            {accounts.map((a) => (
              <option value={a.asset.id}>
                {a.asset.symbol} ({a.balanceFormatted})
              </option>
            ))}
          </Select>
        ) : (
          <p className="text-white-60">{t('withdrawFormNoAsset')}</p>
        )}
      </FormGroup>
      <div className="mb-24">
        <Callout
          title={t('withdrawPreparedWarningHeading')}
          intent={Intent.Warning}
        >
          <p>{t('withdrawPreparedWarningText1')}</p>
          <p className="mb-0">{t('withdrawPreparedWarningText2')}</p>
        </Callout>
      </div>
      <EthAddressInput
        onChange={setDestinationAddress}
        address={destinationAddress}
        connectedAddress={connectedAddress}
        isValid={addressValid}
      />
      <FormGroup label={t('withdrawFormAmountLabel')} labelFor="amount">
        <AmountInput
          amount={amountStr}
          setAmount={setAmount}
          maximum={maximum}
          currency={'VEGA'}
        />
      </FormGroup>
      <StatefulButton
        type="submit"
        disabled={!addressValid || !valid || status === WithdrawStatus.Pending}
      >
        {status === WithdrawStatus.Pending ? (
          <>
            <Loader />
            <span>{t('withdrawFormSubmitButtonPending')}</span>
          </>
        ) : (
          t('withdrawFormSubmitButtonIdle', {
            amount: amountStr,
            symbol: account?.asset.symbol,
          })
        )}
      </StatefulButton>
    </form>
  );
};
