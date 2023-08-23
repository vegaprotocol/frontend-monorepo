import { toNanoSeconds } from '@vegaprotocol/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Loader,
  TradingFormGroup,
  TradingInput,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { formatForInput } from '@vegaprotocol/utils';

const DEFAULT_EXPORT_FILE_NAME = 'ledger_entries.csv';

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};

export const LedgerExportForm = ({ partyId }: { partyId: string }) => {
  const now = useRef(new Date());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const maxFromDate = formatForInput(new Date(dateTo) || now.current);
  const maxToDate = formatForInput(now.current);
  const { data } = useAssetsDataProvider();
  const assets = (data || []).reduce((aggr, item) => {
    aggr[item.id] = item.symbol;
    return aggr;
  }, {} as Record<string, string>);
  const [isDownloading, setIsDownloading] = useState(false);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  useEffect(() => {
    if (!assetId) {
      setAssetId(Object.keys(assets)[0]);
    }
  }, [assetId, assets]);
  const VEGA_URL = useEnvironment((store) => store.VEGA_URL);
  const protohost = VEGA_URL ? getProtoHost(VEGA_URL) : '';
  const disable = !assetId || isDownloading;
  const assetDropDown = (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger
          disabled={isDownloading}
          id="asset"
          className="block w-full"
        >
          {assets[assetId]}
        </DropdownMenuTrigger>
      }
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

  const link = useMemo(() => {
    if (protohost) {
      const dateFromUrl = dateFrom
        ? `&dateRange.startTimestamp=${toNanoSeconds(dateFrom)}`
        : '';
      const dateToUrl = dateTo
        ? `&dateRange.endTimestamp=${toNanoSeconds(dateTo)}`
        : '';
      return `${protohost}/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${assetId}${dateFromUrl}${dateToUrl}`;
    }
    return '';
  }, [protohost, partyId, assetId, dateFrom, dateTo]);
  const startDownload = useCallback(() => {
    setIsDownloading(true);
    fetch(link)
      .then(async (resp) => {
        const { headers } = resp;
        const nameHeader = headers.get('content-disposition');
        const filename =
          nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
        const blob = await resp.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch((err) => {
        localLoggerFactory({ application: 'ledger' }).error(
          'Download file',
          err
        );
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [link]);

  if (!protohost || Object.keys(assets).length === 0) {
    return null;
  }
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col shrink items-stretch gap-2 p-2 w-[350px]">
        <h2 className="mb-4">{t('Export ledger entries')}</h2>
        <TradingFormGroup label={t('Select asset')} labelFor="asset">
          {assetDropDown}
        </TradingFormGroup>
        <TradingFormGroup label={t('Date from')} labelFor="date-from">
          <TradingInput
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            id="date-from"
            disabled={disable}
            max={maxFromDate}
          />
        </TradingFormGroup>
        <TradingFormGroup label={t('Date to')} labelFor="date-to">
          <TradingInput
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            id="date-to"
            disabled={disable}
            max={maxToDate}
          />
        </TradingFormGroup>
        <div
          className="text-sm relative"
          title={t('Download all to .csv file')}
        >
          {isDownloading && (
            <div className="absolute flex w-full h-full justify-center items-center">
              <Loader size="small" />
            </div>
          )}
          <Button
            variant="primary"
            fill
            disabled={disable}
            onClick={startDownload}
            data-testid="ledger-download-button"
          >
            {t('Download')}
          </Button>
        </div>
      </div>
    </div>
  );
};
