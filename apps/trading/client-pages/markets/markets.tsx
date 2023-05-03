import type { MarketMaybeWithData } from '@vegaprotocol/market-list';
import { MarketsContainer } from '@vegaprotocol/market-list';
import { t } from '@vegaprotocol/i18n';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { VegaICellRendererParams } from '@vegaprotocol/datagrid';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DApp, EXPLORER_MARKET, useLinks } from '@vegaprotocol/environment';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';

export const Markets = () => {
  const handleOnSelect = useMarketClickHandler();
  const linkCreator = useLinks(DApp.Explorer);
  return (
    <MarketsContainer
      onSelect={handleOnSelect}
      actions={({
        value,
      }: VegaICellRendererParams<MarketMaybeWithData, 'id'>) => {
        if (!value) return <span />;
        return (
          <DropdownMenu
            trigger={
              <DropdownMenuTrigger
                iconName="more"
                className="hover:bg-vega-light-200 dark:hover:bg-vega-dark-200 p-0.5 focus:rounded-full hover:rounded-full"
                data-testid="dropdown-menu"
              />
            }
          >
            <DropdownMenuContent>
              <DropdownMenuCopyItem value={value} text={t('Copy Market ID')} />
              <DropdownMenuItem>
                <Link
                  href={linkCreator(EXPLORER_MARKET.replace(':id', value))}
                  target="_blank"
                >
                  <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
                  {t('View on Explorer')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    />
  );
};

const DropdownMenuCopyItem = ({
  value,
  text,
}: {
  value: string;
  text: string;
}) => {
  const [copied, setCopied] = useCopyTimeout();

  return (
    <DropdownMenuItem>
      <span>
        <CopyToClipboard text={value} onCopy={() => setCopied(true)}>
          <button
            // Prevent dropdown closing on click
            onClick={(e) => e.stopPropagation()}
            className="mr-2"
          >
            <VegaIcon name={VegaIconNames.COPY} size={16} />
            {text}
          </button>
        </CopyToClipboard>
        {copied && (
          <span className="text-xs text-neutral-500">{t('Copied')}</span>
        )}
      </span>
    </DropdownMenuItem>
  );
};
