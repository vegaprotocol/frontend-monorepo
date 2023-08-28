import { toNanoSeconds } from '@vegaprotocol/utils';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Loader,
  TradingFormGroup,
  TradingInput,
  TradingDropdown,
  TradingDropdownTrigger,
  TradingDropdownContent,
  TradingDropdownItem,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { formatForInput } from '@vegaprotocol/utils';
import { subDays } from 'date-fns';

const DEFAULT_EXPORT_FILE_NAME = 'ledger_entries.csv';

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};

const createDownloadUrl = (
  protohost: string,
  partyId: string,
  assetId: string,
  dateFrom: string,
  dateTo: string,
  now: Date
) => {
  if (protohost && partyId && assetId) {
    const defaultFrom = subDays(now, 7);
    const dateToUrl = dateTo
      ? `&dateRange.endTimestamp=${toNanoSeconds(dateTo)}`
      : '';
    const dateFromUrl = dateFrom
      ? `&dateRange.startTimestamp=${toNanoSeconds(dateFrom)}`
      : dateTo
      ? ''
      : `&dateRange.startTimestamp=${toNanoSeconds(defaultFrom)}`;
    return `${protohost}/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${assetId}${dateFromUrl}${dateToUrl}`;
  }
  return '';
};

interface Props {
  partyId: string;
  vegaUrl: string;
  assets: Record<string, string>;
}

export const LedgerExportForm = ({ partyId, vegaUrl, assets }: Props) => {
  const now = useRef(new Date());
  const defaultFrom = subDays(now.current, 7);
  const [dateFrom, setDateFrom] = useState(formatForInput(defaultFrom));
  const [dateTo, setDateTo] = useState('');
  const maxFromDate = formatForInput(new Date(dateTo || now.current));
  const maxToDate = formatForInput(now.current);

  const [isDownloading, setIsDownloading] = useState(false);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  useEffect(() => {
    if (!assetId) {
      setAssetId(Object.keys(assets)[0]);
    }
  }, [assetId, assets]);
  const protohost = vegaUrl ? getProtoHost(vegaUrl) : '';
  const disabled = Boolean(!assetId || isDownloading);
  const assetDropDown = (
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger
          disabled={isDownloading}
          id="asset"
          className="block w-full py-1 px-2 rounded bg-transparent border border-vega-light-200 dark:border-vega-dark-200"
        >
          <button>{assets[assetId]}</button>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent>
        {Object.keys(assets).map((assetKey) => (
          <TradingDropdownItem
            key={assetKey}
            onSelect={() => setAssetId(assetKey)}
            className="min-w-[315px]"
          >
            {assets[assetKey]}
          </TradingDropdownItem>
        ))}
      </TradingDropdownContent>
    </TradingDropdown>
  );

  const startDownload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const link = createDownloadUrl(
      protohost,
      partyId,
      assetId,
      dateFrom,
      dateTo,
      now.current
    );
    if (link) {
      setIsDownloading(true);
      fetch(link)
        .then(async (resp) => {
          const { headers } = resp;
          const nameHeader = headers.get('content-disposition');
          const filename =
            nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
          const blob = await resp.blob();
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
          }
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
    }
  };

  if (!protohost || Object.keys(assets).length === 0) {
    return null;
  }
  return (
    <div className="h-full relative">
      <form onSubmit={startDownload}>
        <div className="w-full h-full flex justify-center">
          <div className="flex flex-col shrink items-stretch gap-2 p-2 w-[350px]">
            <h2 className="mb-4">{t('Export ledger entries')}</h2>
            <TradingFormGroup label={t('Select asset')} labelFor="asset">
              {assetDropDown}
            </TradingFormGroup>
            <TradingFormGroup label={t('Date from')} labelFor="date-from">
              <TradingInput
                type="datetime-local"
                data-testid="date-from"
                id="date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={disabled}
                max={maxFromDate}
              />
            </TradingFormGroup>
            <TradingFormGroup label={t('Date to')} labelFor="date-to">
              <TradingInput
                type="datetime-local"
                data-testid="date-to"
                id="date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={disabled}
                max={maxToDate}
              />
            </TradingFormGroup>
            <div
              className="text-sm relative"
              title={t('Download all to .csv file')}
            >
              {isDownloading && (
                <div
                  className="absolute flex w-full h-full justify-center items-center"
                  data-testid="download-spinner"
                >
                  <Loader size="small" />
                </div>
              )}
              <Button
                variant="primary"
                fill
                disabled={disabled}
                type="submit"
                data-testid="ledger-download-button"
              >
                {t('Download')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
