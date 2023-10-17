import { useRef, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Intent,
  Loader,
  TradingButton,
  TradingFormGroup,
  TradingInput,
  TradingSelect,
} from '@vegaprotocol/ui-toolkit';
import { z } from 'zod';
import {
  formatForInput,
  toNanoSeconds,
  VEGA_ID_REGEX,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useLedgerDownloadFile } from './ledger-download-store';

const DEFAULT_EXPORT_FILE_NAME = 'ledger_entries.csv';

const toHoursAndMinutes = (totalMinutes: number) => {
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${hours > 0 ? '+' : '-'}${padTo2Digits(hours)}:${padTo2Digits(
    minutes
  )}`;
};

const padTo2Digits = (num: number) => Math.abs(num).toString().padStart(2, '0');

const getProtoHost = (vegaurl: string) => {
  const loc = new URL(vegaurl);
  return `${loc.protocol}//${loc.host}`;
};

const downloadSchema = z.object({
  protohost: z.string().url().nonempty(),
  partyId: z.string().regex(VEGA_ID_REGEX).nonempty(),
  assetId: z.string().regex(VEGA_ID_REGEX).nonempty(),
  dateFrom: z.string().nonempty(),
  dateTo: z.string().optional(),
});

export const createDownloadUrl = (args: z.infer<typeof downloadSchema>) => {
  // check args from form inputs
  downloadSchema.parse(args);

  const params = new URLSearchParams();
  params.append('partyId', args.partyId);
  params.append('assetId', args.assetId);
  params.append('dateRange.startTimestamp', toNanoSeconds(args.dateFrom));

  if (args.dateTo) {
    params.append('dateRange.endTimestamp', toNanoSeconds(args.dateTo));
  }

  const url = new URL(args.protohost);
  url.pathname = '/api/v2/ledgerentry/export';
  url.search = params.toString();

  return url.toString();
};

interface Props {
  partyId: string;
  vegaUrl: string;
  assets: Record<string, string>;
}

export const LedgerExportForm = ({ partyId, vegaUrl, assets }: Props) => {
  const now = useRef(new Date());
  const [dateFrom, setDateFrom] = useState(() => {
    return formatForInput(subDays(now.current, 7));
  });
  const [dateTo, setDateTo] = useState('');
  const maxFromDate = formatForInput(new Date(dateTo || now.current));
  const maxToDate = formatForInput(now.current);

  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  const protohost = getProtoHost(vegaUrl);
  const disabled = Boolean(!assetId);

  const hasItem = useLedgerDownloadFile((store) => store.hasItem);
  const updateDownloadQueue = useLedgerDownloadFile(
    (store) => store.updateQueue
  );

  const assetDropDown = (
    <TradingSelect
      id="select-ledger-asset"
      value={assetId}
      onChange={(e) => {
        setAssetId(e.target.value);
      }}
      className="w-full"
      data-testid="select-ledger-asset"
    >
      {Object.keys(assets).map((assetKey) => (
        <option key={assetKey} value={assetKey}>
          {assets[assetKey]}
        </option>
      ))}
    </TradingSelect>
  );

  const link = createDownloadUrl({
    protohost,
    partyId,
    assetId,
    dateFrom,
    dateTo,
  });

  const startDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = t('Downloading for %s from %s till %s', [
      assets[assetId],
      format(new Date(dateFrom), 'dd MMMM yyyy HH:mm'),
      format(new Date(dateTo || Date.now()), 'dd MMMM yyyy HH:mm'),
    ]);

    const downloadStoreItem = {
      title,
      link,
      isChanged: true,
    };
    if (hasItem(link)) {
      updateDownloadQueue(downloadStoreItem);
      return;
    }
    const ts = setTimeout(() => {
      updateDownloadQueue({
        ...downloadStoreItem,
        intent: Intent.Warning,
        isDelayed: true,
        isChanged: true,
      });
    }, 1000 * 30);

    try {
      updateDownloadQueue(downloadStoreItem);
      const resp = await fetch(link);
      if (!resp?.ok) {
        if (resp?.status === 429) {
          throw new Error('Too many requests. Try again later.');
        }
        throw new Error('Download of ledger entries failed');
      }
      const { headers } = resp;
      const nameHeader = headers.get('content-disposition');
      const filename = nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
      updateDownloadQueue({
        ...downloadStoreItem,
        filename,
      });
      const blob = await resp.blob();
      if (blob) {
        updateDownloadQueue({
          ...downloadStoreItem,
          blob,
          isDownloaded: true,
          isChanged: true,
          intent: Intent.Success,
        });
      }
    } catch (err) {
      localLoggerFactory({ application: 'ledger' }).error('Download file', err);
      updateDownloadQueue({
        ...downloadStoreItem,
        intent: Intent.Danger,
        isError: true,
        isChanged: true,
        errorMessage: (err as Error).message || undefined,
      });
    } finally {
      clearTimeout(ts);
    }
  };

  if (!protohost || Object.keys(assets).length === 0) {
    return null;
  }

  const offset = new Date().getTimezoneOffset();

  return (
    <form onSubmit={startDownload} className="p-4 w-[350px]">
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
          max={maxToDate}
        />
      </TradingFormGroup>
      <div className="relative text-sm" title={t('Download all to .csv file')}>
        <TradingButton
          fill
          disabled={disabled}
          type="submit"
          data-testid="ledger-download-button"
        >
          {t('Download')}
        </TradingButton>
      </div>
      {offset && (
        <p className="text-xs text-neutral-400 mt-1">
          {t(
            'The downloaded file uses the UTC time zone for all listed times. Your time zone is UTC%s.',
            [toHoursAndMinutes(offset)]
          )}
        </p>
      )}
    </form>
  );
};
