import { useState, useCallback, useRef } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import {
  Link,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks/use-environment';
import { Networks } from '../../types';
import { DApp, TOKEN_NEW_NETWORK_PARAM_PROPOSAL, useLinks } from '../../hooks';

export const envNameMapping: Record<Networks, string> = {
  [Networks.CUSTOM]: t('Custom'),
  [Networks.DEVNET]: t('Devnet'),
  [Networks.SANDBOX]: t('Sandbox'),
  [Networks.STAGNET1]: t('Stagnet'),
  [Networks.STAGNET3]: t('Stagnet3'),
  [Networks.TESTNET]: t('Fairground testnet'),
  [Networks.MAINNET]: t('Mainnet'),
  [Networks.MIRROR]: t('Mainnet mirror'),
};

export const envTriggerMapping: Record<Networks, string> = {
  ...envNameMapping,
  [Networks.TESTNET]: t('Fairground'),
};

export const envDescriptionMapping: Record<Networks, string> = {
  [Networks.CUSTOM]: '',
  [Networks.SANDBOX]: t('A playground test environment'),
  [Networks.DEVNET]: t('The latest Vega code auto-deployed'),
  [Networks.STAGNET1]: t('A release candidate for the staging environment'),
  [Networks.STAGNET3]: t('A staging environment with trading'),
  [Networks.TESTNET]: t(
    'Public testnet run by the Vega team, often used for incentives'
  ),
  [Networks.MAINNET]: t('The vega mainnet'),
  [Networks.MIRROR]: t(
    'A mirror of the mainnet environment running on an Ethereum test network'
  ),
};

const standardNetworkKeys = [Networks.MAINNET, Networks.TESTNET];
const advancedNetworkKeys = [
  Networks.MAINNET,
  Networks.TESTNET,
  Networks.STAGNET3,
  Networks.DEVNET,
];

type NetworkLabelProps = {
  isCurrent: boolean;
  isAvailable: boolean;
};

const getLabelText = ({
  isCurrent = false,
  isAvailable = false,
}: NetworkLabelProps) => {
  if (isCurrent) {
    return ` (${t('current')})`;
  }
  if (!isAvailable) {
    return ` (${t('not available')})`;
  }
  return '';
};

const NetworkLabel = ({
  isCurrent = false,
  isAvailable = false,
}: NetworkLabelProps) => (
  <span className="text-neutral-800">
    {getLabelText({ isCurrent, isAvailable })}
  </span>
);

export const NetworkSwitcher = () => {
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const [isOpen, setOpen] = useState(false);
  const [isAdvancedView, setAdvancedView] = useState(false);

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        setAdvancedView(false);
      }
    },
    [setOpen, setAdvancedView]
  );
  const menuRef = useRef<HTMLButtonElement | null>(null);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpen}>
      <DropdownMenuTrigger
        ref={menuRef}
        className="w-full flex justify-between items-center"
      >
        {envTriggerMapping[VEGA_ENV]}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ minWidth: `${menuRef.current?.offsetWidth || 290}px` }}
      >
        {!isAdvancedView && (
          <>
            {standardNetworkKeys.map((key) => (
              <DropdownMenuItem
                key={key}
                data-testid="network-item"
                disabled={!VEGA_NETWORKS[key]}
              >
                <a href={VEGA_NETWORKS[key]}>
                  {envNameMapping[key]}
                  <NetworkLabel
                    isCurrent={VEGA_ENV === key}
                    isAvailable={!!VEGA_NETWORKS[key]}
                  />
                </a>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAdvancedView(true);
              }}
              className="w-full flex flex-col items-stretch"
            >
              {t('Advanced')}
            </DropdownMenuItem>
          </>
        )}
        {isAdvancedView && (
          <>
            {advancedNetworkKeys.map((key) => (
              <DropdownMenuItem key={key} data-testid="network-item-advanced">
                <div className="mr-4">
                  <Link href={VEGA_NETWORKS[key]}>{envNameMapping[key]}</Link>
                  <NetworkLabel
                    isCurrent={VEGA_ENV === key}
                    isAvailable={!!VEGA_NETWORKS[key]}
                  />
                </div>
                <span
                  className="hidden md:inline"
                  data-testid="network-item-description"
                >
                  {envDescriptionMapping[key]}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        <div
          className="relative flex items-center justify-between mx-2 py-2 border-t border-neutral-400 pt-2 text-sm"
          key="propose-network-param"
        >
          <ExternalLink href={tokenLink(TOKEN_NEW_NETWORK_PARAM_PROPOSAL)}>
            {t('Propose a network parameter change')}
          </ExternalLink>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
