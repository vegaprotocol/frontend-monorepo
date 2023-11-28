import { useRef, useCallback } from 'react';
import { subDays } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import {
  InputError,
  Intent,
  TradingButton,
  TradingFormGroup,
  TradingInput,
  TradingSelect,
} from '@vegaprotocol/ui-toolkit';
import {
  formatForInput,
  getDateTimeFormat,
  toNanoSeconds,
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

type LedgerFormValues = {
  assetId: string;
  dateFrom: string;
  dateTo?: string;
};

export const createDownloadUrl = (
  args: LedgerFormValues & {
    partyId: string;
    protohost: string;
  }
) => {
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
  const { control, handleSubmit, watch } = useForm<LedgerFormValues>({
    defaultValues: {
      dateFrom: formatForInput(subDays(now.current, 7)),
      dateTo: '',
      assetId: Object.keys(assets)[0],
    },
  });
  const dateTo = watch('dateTo');
  const maxFromDate = formatForInput(new Date(dateTo || now.current));
  const maxToDate = formatForInput(now.current);
  const protohost = getProtoHost(vegaUrl);

  const hasItem = useLedgerDownloadFile((store) => store.hasItem);
  const updateDownloadQueue = useLedgerDownloadFile(
    (store) => store.updateQueue
  );

  const startDownload = useCallback(
    async (formValues: LedgerFormValues) => {
      const link = createDownloadUrl({
        protohost,
        partyId,
        ...formValues,
      });

      const dateTimeFormatter = getDateTimeFormat();
      const title = t('Downloading for %s from %s till %s', [
        assets[formValues.assetId],
        dateTimeFormatter.format(new Date(formValues.dateFrom)),
        dateTimeFormatter.format(new Date(formValues.dateTo || Date.now())),
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
        const filename =
          nameHeader?.split('=').pop() ?? DEFAULT_EXPORT_FILE_NAME;
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
        localLoggerFactory({ application: 'ledger' }).error(
          'Download file',
          err
        );
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
    },
    [assets, hasItem, partyId, protohost, updateDownloadQueue]
  );

  if (!protohost || Object.keys(assets).length === 0) {
    return null;
  }

  const offset = new Date().getTimezoneOffset();

  return (
    <form
      onSubmit={handleSubmit(startDownload)}
      className="p-4 w-[350px]"
      noValidate
    >
      <h2 className="mb-4">{t('Export ledger entries')}</h2>
      <Controller
        name="assetId"
        control={control}
        rules={{
          required: t('You need to select an asset'),
        }}
        render={({ field, fieldState }) => (
          <div className="mb-2">
            <TradingFormGroup
              label={t('Select asset')}
              labelFor="asset"
              compact
            >
              <TradingSelect
                {...field}
                id="select-ledger-asset"
                className="w-full"
                data-testid="select-ledger-asset"
              >
                {Object.keys(assets).map((assetKey) => (
                  <option key={assetKey} value={assetKey}>
                    {assets[assetKey]}
                  </option>
                ))}
              </TradingSelect>
            </TradingFormGroup>
            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </div>
        )}
      />
      <Controller
        name="dateFrom"
        control={control}
        rules={{
          required: t('You need to provide a date from'),
          max: {
            value: maxFromDate,
            message: dateTo
              ? t('Date from cannot be greater than date to')
              : t('Date from cannot be in the future'),
          },
          deps: ['dateTo'],
        }}
        render={({ field, fieldState }) => (
          <div className="mb-2">
            <TradingFormGroup
              label={t('Date from')}
              labelFor="date-from"
              compact
            >
              <TradingInput
                {...field}
                type="datetime-local"
                data-testid="date-from"
                id="date-from"
                max={maxFromDate}
              />
            </TradingFormGroup>
            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </div>
        )}
      />
      <Controller
        name="dateTo"
        control={control}
        rules={{
          max: {
            value: maxToDate,
            message: t('Date to cannot be in the future'),
          },
        }}
        render={({ field, fieldState }) => (
          <div className="mb-2">
            <TradingFormGroup label={t('Date to')} labelFor="date-to" compact>
              <TradingInput
                {...field}
                type="datetime-local"
                data-testid="date-to"
                id="date-to"
                max={maxToDate}
              />
            </TradingFormGroup>
            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </div>
        )}
      />
      <div className="relative text-sm" title={t('Download all to .csv file')}>
        <TradingButton fill type="submit" data-testid="ledger-download-button">
          {t('Download')}
        </TradingButton>
      </div>
      {offset ? (
        <p className="text-xs text-neutral-400 mt-1">
          {t(
            'The downloaded file uses the UTC time zone for all listed times. Your time zone is UTC%s.',
            [toHoursAndMinutes(offset)]
          )}
        </p>
      ) : null}
    </form>
  );
};
