import type { LedgerEntry } from './ledger-entries-data-provider';
import { useMemo, useState } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};

export const LedgerExportLink = ({
  partyId,
  entries,
}: {
  partyId: string;
  entries: LedgerEntry[];
}) => {
  const assets = entries.reduce((aggr, item) => {
    if (item.asset && !(item.asset.id in aggr)) {
      aggr[item.asset.id] = item.asset.symbol;
    }
    return aggr;
  }, {} as Record<string, string>);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const protohost = VEGA_URL ? getProtoHost(VEGA_URL) : '';

  const assetDropDown = useMemo(() => {
    return (
      <DropdownMenu
        trigger={<DropdownMenuTrigger>{assets[assetId]}</DropdownMenuTrigger>}
      >
        <DropdownMenuContent>
          {Object.keys(assets).map((assetKey) => (
            <DropdownMenuItem
              key={assetKey}
              onSelect={() => setAssetId(assetKey)}
            >
              {assets[assetKey]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [assetId, assets]);

  if (!protohost) {
    return null;
  }
  return (
    <div className="flex shrink">
      {assetId ? (
        <Link
          className="h-[50px] text-sm p-2"
          title={t('Download all to .csv file')}
          href={`${protohost}/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${assetId}`}
        >
          {t('Export all of')} {assetDropDown} {t('to .csv file')}
        </Link>
      ) : (
        <>{t('Select asset to export')}</>
      )}
    </div>
  );
};
