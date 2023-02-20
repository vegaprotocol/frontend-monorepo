import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
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
} from 'date-fns';
import { t } from '../i18n';

const defaultFilterValue: Schema.DateRange = {};
interface DateRangeFilterProps extends IFilterParams {
  defaultRangeFilter?: Schema.DateRange;
  maxSubDays?: number;
  maxDaysRange?: number;
}

const PickerContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex relative">{children}</div>;
};

export const DateRangeFilter = forwardRef(
  (props: DateRangeFilterProps, ref) => {
    const defaultDates = props?.defaultRangeFilter || defaultFilterValue;
    const [value, setValue] = useState<Schema.DateRange>(defaultDates);
    const [error, setError] = useState<string>('');
    const [minStartDate, maxStartDate, minEndDate, maxEndDate] = useMemo(() => {
      const minStartDate = props?.maxSubDays
        ? subDays(Date.now(), props.maxSubDays)
        : null;
      const maxStartDate = props?.maxSubDays ? new Date() : null;
      const minEndDate =
        value.start && props?.maxDaysRange
          ? new Date(value.start)
          : minStartDate;
      const maxEndDate =
        value.start && props?.maxDaysRange
          ? min([
              new Date(),
              addDays(new Date(value.start), props.maxDaysRange),
            ])
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
      update: Schema.DateRange
    ) => {
      if (
        props?.maxSubDays &&
        isBefore(new Date(timeValue), subDays(Date.now(), props.maxSubDays + 1))
      ) {
        setError(
          t(
            'The oldest date possible to query is %s days',
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
              'Max possible days range to query is %s days',
              String(props.maxDaysRange)
            )
          );
          return false;
        }
      }
      setError('');
      return true;
    };
    const onChange = (date: Date | null, name: string) => {
      if (date) {
        const stringedDate = date ? formatRFC3339(date) : '';
        const update = { [name]: stringedDate };
        if (name === 'start' && props.maxDaysRange) {
          const endDate = new Date(value.end || new Date());
          if (Math.abs(differenceInDays(date, endDate)) > props.maxDaysRange) {
            update.end = formatRFC3339(
              min([new Date(), addDays(date, props.maxDaysRange)])
            ).replace('Z', '000000Z');
          } else if (isBefore(endDate, date)) {
            update.end = formatRFC3339(min([new Date(), addDays(date, 1)]));
          }
        }
        if (validate(name, date, update)) {
          setValue({
            ...value,
            ...update,
          });
        }
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
        <div className="ag-filter-apply-panel flex min-h-[1rem]">{not}</div>
      );
    };

    const start = (value.start && new Date(value.start)) || null;
    const end = (value.end && new Date(value.end)) || null;
    return (
      <div className="ag-filter-body-wrapper inline-block min-w-fit">
        <Notification />
        <div className="ag-filter-apply-panel">
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="start">
              <span className="block mb-1">{t('Start')}</span>
            </label>
            <DatePicker
              name="start"
              showTimeSelect
              selectsStart
              selected={start}
              onChange={(date) => onChange(date, 'start')}
              minDate={minStartDate}
              maxDate={maxStartDate}
              calendarContainer={PickerContainer}
              inline
            />
          </fieldset>
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="end">
              <span className="block mb-1">{t('End')}</span>
            </label>
            <DatePicker
              name="end"
              showTimeSelect
              selectsEnd
              selected={end}
              onChange={(date) => onChange(date, 'end')}
              minDate={minEndDate}
              maxDate={maxEndDate}
              calendarContainer={PickerContainer}
              inline
            />
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
