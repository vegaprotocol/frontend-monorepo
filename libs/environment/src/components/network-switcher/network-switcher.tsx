import { useState, useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ExternalLink,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks/use-environment';
import { Networks } from '../../types';
import { DApp, TOKEN_NEW_NETWORK_PARAM_PROPOSAL, useLinks } from '../../hooks';
import classNames from 'classnames';

export const envNameMapping: Record<Networks, string> = {
  [Networks.VALIDATOR_TESTNET]: t('VALIDATOR_TESTNET'),
  [Networks.CUSTOM]: t('Custom'),
  [Networks.DEVNET]: t('Devnet'),
  [Networks.STAGNET1]: t('Stagnet'),
  [Networks.TESTNET]: t('Fairground testnet'),
  [Networks.MAINNET]: t('Mainnet'),
};

export const envTriggerMapping: Record<Networks, string> = {
  ...envNameMapping,
  [Networks.TESTNET]: t('Fairground'),
};

export const envDescriptionMapping: Record<Networks, string> = {
  [Networks.CUSTOM]: '',
  [Networks.VALIDATOR_TESTNET]: t('The validator deployed testnet'),
  [Networks.DEVNET]: t('The latest Vega code auto-deployed'),
  [Networks.STAGNET1]: t('A release candidate for the staging environment'),
  [Networks.TESTNET]: t(
    'Public testnet run by the Vega team, often used for incentives'
  ),
  [Networks.MAINNET]: t('The vega mainnet'),
};

const standardNetworkKeys = [Networks.MAINNET, Networks.TESTNET];
const advancedNetworkKeys = [
  Networks.MAINNET,
  Networks.TESTNET,
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
  <span className="text-vega-dark-300 dark:text-vega-light-300">
    {getLabelText({ isCurrent, isAvailable })}
  </span>
);

type NetworkSwitcherProps = {
  /**
   * The current network identifier, defaults to the `VEGA_ENV` if unset.
   */
  currentNetwork?: Networks;
  className?: string;
};
export const NetworkSwitcher = ({
  currentNetwork,
  className,
}: NetworkSwitcherProps) => {
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

  const current = currentNetwork || VEGA_ENV;

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={handleOpen}
      trigger={
        <DropdownMenuTrigger
          data-testid="network-switcher"
          className={classNames(
            'flex justify-between items-center text-sm text-vega-dark-600 dark:text-vega-light-600 py-1 px-2 rounded border border-vega-dark-200 whitespace-nowrap dark:hover:bg-vega-dark-500 hover:bg-vega-light-500',
            className
          )}
        >
          <span className="flex justify-between items-center gap-2">
            <span>{envTriggerMapping[current]}</span>
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </span>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent align="start">
        {!isAdvancedView && (
          <>
            {standardNetworkKeys.map((key) => (
              <DropdownMenuItem
                key={key}
                data-testid="network-item"
                disabled={!VEGA_NETWORKS[key]}
                role="link"
                onClick={() =>
                  (window.location.href = VEGA_NETWORKS[key] || '')
                }
              >
                {envNameMapping[key]}
                <NetworkLabel
                  isCurrent={current === key}
                  isAvailable={!!VEGA_NETWORKS[key]}
                />
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
              <DropdownMenuItem
                key={key}
                data-testid="network-item-advanced"
                role="link"
                onClick={() =>
                  (window.location.href = VEGA_NETWORKS[key] || '')
                }
              >
                <div className="w-full flex justify-between gap-2">
                  <div>
                    {envNameMapping[key]}
                    <NetworkLabel
                      isCurrent={current === key}
                      isAvailable={!!VEGA_NETWORKS[key]}
                    />
                  </div>
                  <span
                    className="hidden md:inline"
                    data-testid="network-item-description"
                  >
                    {envDescriptionMapping[key]}
                  </span>
                </div>
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
