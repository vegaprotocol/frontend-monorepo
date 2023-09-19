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
import { gql, useQuery } from '@apollo/client';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { DApp, TokenStaticLinks, useLinks } from '@vegaprotocol/environment';

const CREATE_CODE_QUERY = gql`
  query CreateCode($partyId: ID!) {
    party(id: $partyId) {
      stakingSummary {
        currentStakeAvailable
      }
    }
    networkParameter(key: "referralProgram.minStakedVegaTokens") {
      value
    }
  }
`;

export const CreateCodeContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data, loading } = useQuery(CREATE_CODE_QUERY, {
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
    // TOOD: remove when network params available
    errorPolicy: 'ignore',
  });

  if (loading) return null;

  const requiredStake = data?.networkParameter?.value || '0';
  const currentStakeAvailable =
    data?.party?.stakingSummary.currentStakeAvailable || '0';

  return (
    <CreateCodeForm
      currentStakeAvailable={currentStakeAvailable}
      requiredStake={requiredStake}
    />
  );
};

export const CreateCodeForm = ({
  currentStakeAvailable,
  requiredStake,
}: {
  currentStakeAvailable: string;
  requiredStake: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const { pubKey } = useVegaWallet();

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
        <div className="text-center">
          <RainbowButton
            variant="border"
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
      </div>
      <Dialog
        title="Create a referral code"
        open={dialogOpen}
        onChange={() => setDialogOpen(false)}
        size="small"
      >
        <CreateCodeDialog
          currentStakeAvailable={currentStakeAvailable}
          setDialogOpen={setDialogOpen}
          requiredStake={requiredStake}
        />
      </Dialog>
    </div>
  );
};

const CreateCodeDialog = ({
  setDialogOpen,
  currentStakeAvailable,
  requiredStake,
}: {
  setDialogOpen: (open: boolean) => void;
  currentStakeAvailable: string;
  requiredStake: string;
}) => {
  const createLink = useLinks(DApp.Governance);
  const { isReadOnly, pubKey, sendTx } = useVegaWallet();
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

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
        onClick: () => setDialogOpen(false),
      };
    }
  };

  // TODO: Add when network parameters are updated

  if (
    currentStakeAvailable === '0' ||
    BigInt(currentStakeAvailable) < BigInt(requiredStake)
  ) {
    return (
      <div className="flex flex-col gap-4">
        <p>
          You need at least {addDecimalsFormatNumber(requiredStake, 18)} VEGA
          staked to generate a referral code and participate in the referral
          program.
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
          Generate a referral code to share with your friends aand start enaring
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
      {/* TODO: Add links */}
      <div className="flex justify-center pt-5 mt-2 text-sm border-t gap-4 text-default border-default">
        <ExternalLink>About the referral program</ExternalLink>
        <ExternalLink>Disclaimer</ExternalLink>
      </div>
    </div>
  );
};
