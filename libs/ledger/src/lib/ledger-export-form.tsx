import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { useCallback, useRef, useState } from 'react';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import {
  Intent,
  Loader,
  TradingButton,
  TradingFormGroup,
  TradingInput,
  TradingSelect,
  useToasts,
} from '@vegaprotocol/ui-toolkit';
import { z } from 'zod';
import {
  formatForInput,
  toNanoSeconds,
  VEGA_ID_REGEX,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { subDays } from 'date-fns';

const DEFAULT_EXPORT_FILE_NAME = 'ledger_entries.csv';
const DOWNLOAD_LEDGER_TOAST_ID = 'ledger_entries_toast_id';

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

const ErrorContent = () => (
  <>
    <h4 className="mb-1 text-sm">{t('Something went wrong')}</h4>
    <p>{t('Try again later')}</p>
  </>
);

const InfoContent = ({ progress = false }) => (
  <>
    <h4 className="mb-1 text-sm">
      {progress ? t('Still in progress') : t('Download has been started')}
    </h4>
    <p>{t('Please note this can take several minutes.')}</p>
    <p>{t('You will be noticed here when file will be ready.')}</p>
  </>
);

export const LedgerExportForm = ({ partyId, vegaUrl, assets }: Props) => {
  const now = useRef(new Date());
  const [dateFrom, setDateFrom] = useState(() => {
    return formatForInput(subDays(now.current, 7));
  });
  const [dateTo, setDateTo] = useState('');
  const maxFromDate = formatForInput(new Date(dateTo || now.current));
  const maxToDate = formatForInput(now.current);

  const [isDownloading, setIsDownloading] = useState(false);
  const [assetId, setAssetId] = useState(Object.keys(assets)[0]);
  const protohost = getProtoHost(vegaUrl);
  const disabled = Boolean(!assetId || isDownloading);

  const [setToast, updateToast, hasToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.update,
    store.hasToast,
    store.remove,
  ]);

  const onDownloadClose = useCallback(() => {
    removeToast(DOWNLOAD_LEDGER_TOAST_ID);
  }, [removeToast]);

  const createToast = (
    content: ReactNode,
    intent: Intent = Intent.Primary,
    loader = true
  ) => {
    const title = t('Downloading ledger entries of %s from %s till %s', [
      assets[assetId],
      format(new Date(dateFrom), 'dd MMMM yyyy HH:mm'),
      format(new Date(dateTo || Date.now()), 'dd MMMM yyyy HH:mm'),
    ]);
    const toast: Toast = {
      id: DOWNLOAD_LEDGER_TOAST_ID,
      intent,
      content: (
        <>
          <h3 className="mb-1 text-md uppercase">{title}</h3>
          {content}
        </>
      ),
      onClose: onDownloadClose,
      loader,
    };
    if (hasToast(DOWNLOAD_LEDGER_TOAST_ID)) {
      updateToast(DOWNLOAD_LEDGER_TOAST_ID, toast);
    } else {
      setToast(toast);
    }
  };

  const assetDropDown = (
    <TradingSelect
      id="select-ledger-asset"
      value={assetId}
      onChange={(e) => {
        setAssetId(e.target.value);
      }}
      className="w-full"
      data-testid="select-ledger-asset"
      disabled={isDownloading}
    >
      {Object.keys(assets).map((assetKey) => (
        <option key={assetKey} value={assetKey}>
          {assets[assetKey]}
        </option>
      ))}
    </TradingSelect>
  );

  const startDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ts = setTimeout(() => {
      createToast(<InfoContent progress />, Intent.Warning);
    }, 1000 * 30);

    try {
      createToast(<InfoContent />, Intent.Primary);
      const link = createDownloadUrl({
        protohost,
        partyId,
        assetId,
        dateFrom,
        dateTo,
      });
      setIsDownloading(true);
      const resp = await fetch(link);
      const { headers } = resp;
      const nameHeader = headers.get('content-disposition');
      const filename = nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
      const blob = await resp.blob();
      if (blob) {
        const content = (
          <>
            <h4 className="mb-1 text-sm">{t('File is ready')}</h4>
            <a
              onClick={onDownloadClose}
              href={URL.createObjectURL(blob)}
              download={filename}
              className="underline"
            >
              {t('Get file here')}
            </a>
          </>
        );
        createToast(content, Intent.Success, false);
      }
    } catch (err) {
      localLoggerFactory({ application: 'ledger' }).error('Download file', err);
      createToast(<ErrorContent />, Intent.Danger);
    } finally {
      setIsDownloading(false);
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
      <div className="relative text-sm" title={t('Download all to .csv file')}>
        {isDownloading && (
          <div
            className="absolute flex items-center justify-center w-full h-full"
            data-testid="download-spinner"
          >
            <Loader size="small" />
          </div>
        )}
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
