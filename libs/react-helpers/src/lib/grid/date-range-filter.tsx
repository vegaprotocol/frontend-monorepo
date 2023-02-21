import type { ChangeEvent } from 'react';
import { useEffect, useMemo } from 'react';
import type * as Schema from '@vegaprotocol/types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import {
  isBefore,
  subDays,
  addDays,
  differenceInDays,
  formatRFC3339,
  min,
  isValid,
} from 'date-fns';
import { t } from '../i18n';
import { formatForInput } from '../format/date';

const defaultFilterValue: Schema.DateRange = {};
export interface DateRangeFilterProps extends IFilterParams {
  defaultRangeFilter?: Schema.DateRange;
  maxSubDays?: number;
  maxDaysRange?: number;
}

export const DateRangeFilter = forwardRef(
  (props: DateRangeFilterProps, ref) => {
    const defaultDates = props?.defaultRangeFilter || defaultFilterValue;
    const [value, setValue] = useState<Schema.DateRange>(defaultDates);
    const [error, setError] = useState<string>('');
    const [minStartDate, maxStartDate, minEndDate, maxEndDate] = useMemo(() => {
      const minStartDate = props?.maxSubDays
        ? formatForInput(subDays(Date.now(), props.maxSubDays))
        : undefined;
      const maxStartDate = props?.maxSubDays
        ? formatForInput(new Date())
        : undefined;
      const minEndDate =
        value.start && props?.maxDaysRange
          ? formatForInput(new Date(value.start))
          : minStartDate;
      const maxEndDate =
        value.start && props?.maxDaysRange
          ? formatForInput(
              min([
                new Date(),
                addDays(new Date(value.start), props.maxDaysRange),
              ])
            )
          : maxStartDate;
      return [minStartDate, maxStartDate, minEndDate, maxEndDate];
    }, [props?.maxSubDays, props?.maxDaysRange, value.start]);
    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
      return {
        doesFilterPass(params: IDoesFilterPassParams) {
          const { api, colDef, column, columnApi, context } = props;
          const { node } = params;
          const rowValue = props.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
          });
          if (
            value.start &&
            rowValue &&
            new Date(rowValue) <= new Date(value.start)
          ) {
            return false;
          }
          if (
            value.end &&
            rowValue &&
            new Date(rowValue) >= new Date(value.end)
          ) {
            return false;
          }
          return true;
        },

        isFilterActive() {
          return value.start || value.end;
        },

        getModel() {
          if (!this.isFilterActive()) {
            return null;
          }

          return { value };
        },

        setModel(model?: { value: Schema.DateRange } | null) {
          setValue(
            model?.value || props?.defaultRangeFilter || defaultFilterValue
          );
        },
      };
    });
    const validate = (
      name: string,
      timeValue: Date,
      update?: Schema.DateRange
    ) => {
      if (
        props?.maxSubDays &&
        isBefore(new Date(timeValue), subDays(Date.now(), props.maxSubDays + 1))
      ) {
        setError(
          t(
            'The earliest data that can be queried is %s days ago.',
            String(props.maxSubDays)
          )
        );
        return false;
      }
      if (props?.maxDaysRange) {
        const contrvalue =
          name === 'start'
            ? update?.end || value.end
            : update?.start || value.start;
        if (
          Math.abs(
            differenceInDays(new Date(timeValue), new Date(contrvalue))
          ) > props.maxDaysRange
        ) {
          setError(
            t(
              'The maximum time range that can be queried is %s days.',
              String(props.maxDaysRange)
            )
          );
          return false;
        }
      }
      setError('');
      return true;
    };
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value: dateValue, name } = event.target;
      const date = new Date(dateValue || defaultDates[name as 'start' | 'end']);
      const stringedDate = isValid(date) ? formatRFC3339(date) : undefined;
      let update = { [name]: stringedDate };
      if (name === 'start' && props.maxDaysRange) {
        const endDate = new Date(value.end || Date.now());
        if (Math.abs(differenceInDays(date, endDate)) > props.maxDaysRange) {
          update = {
            ...update,
            end: formatRFC3339(
              min([new Date(), addDays(date, props.maxDaysRange)])
            ),
          };
        } else if (isBefore(endDate, date)) {
          update = {
            ...update,
            end: formatRFC3339(min([new Date(), addDays(date, 1)])),
          };
        }
      }
      if (validate(name, date, update)) {
        setValue({
          ...value,
          ...update,
        });
      }
    };
    useEffect(() => {
      props?.filterChangedCallback();
    }, [value, props]);

    const Notification = () => {
      const not = error ? (
        <div className="border-vega-pink bg-vega-pink-300 dark:bg-vega-pink-650 border rounded p-2 flex items-start gap-2.5 m-4 w-full">
          <div className="text-vega-pink flex items-start mt-1">
            <svg
              role="img"
              className="fill-current w-3 h-3"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99-.01c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13h-2v-2h2v2zm0-3h-2v-7h2v7z"
              />
            </svg>
          </div>
          <div className="text-sm">{error}</div>
        </div>
      ) : null;
      return (
        <div className="ag-filter-apply-panel flex min-h-[2rem]">{not}</div>
      );
    };

    const start =
      (value.start && formatForInput(new Date(value.start))) || undefined;
    const end = (value.end && formatForInput(new Date(value.end))) || '';
    return (
      <div className="ag-filter-body-wrapper inline-block min-w-fit">
        <Notification />
        <div className="ag-filter-apply-panel">
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="start">
              <span className="block mb-1">{t('Start')}</span>
              <input
                type="datetime-local"
                name="start"
                value={start}
                onChange={onChange}
                min={minStartDate}
                max={maxStartDate}
              />
            </label>
          </fieldset>
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="end">
              <span className="block mb-1">{t('End')}</span>
              <input
                type="datetime-local"
                name="end"
                value={end}
                onChange={onChange}
                min={minEndDate}
                max={maxEndDate}
              />
            </label>
          </fieldset>
        </div>
        <div className="ag-filter-apply-panel">
          <button
            type="button"
            className="ag-standard-button ag-filter-apply-panel-button"
            onClick={() => {
              setError('');
              setValue(props.defaultRangeFilter || defaultFilterValue);
            }}
          >
            {t('Reset')}
          </button>
        </div>
      </div>
    );
  }
);
