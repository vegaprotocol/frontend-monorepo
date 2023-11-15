import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { type DateRange } from '@vegaprotocol/types';
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import {
  isBefore,
  subDays,
  addDays,
  differenceInDays,
  formatRFC3339,
  min,
  max,
  isValid,
} from 'date-fns';
import { formatForInput } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { TradingInputError } from '@vegaprotocol/ui-toolkit';

const defaultValue: DateRange = {};
export interface DateRangeFilterProps extends IFilterParams {
  defaultValue?: DateRange;
  maxSubDays?: number;
  maxNextDays?: number;
  maxDaysRange?: number;
}

export const DateRangeFilter = forwardRef(
  (props: DateRangeFilterProps, ref) => {
    const defaultDates = props?.defaultValue || defaultValue;
    const [value, setValue] = useState<DateRange>(defaultDates);
    const valueRef = useRef<DateRange>(value);
    const [error, setError] = useState<string>('');
    const [minStartDate, maxStartDate, minEndDate, maxEndDate] = useMemo(() => {
      const minStartDate =
        props?.maxSubDays !== undefined
          ? formatForInput(subDays(Date.now(), props.maxSubDays))
          : '';
      const maxStartDate =
        props?.maxNextDays !== undefined
          ? formatForInput(addDays(Date.now(), props.maxNextDays))
          : '';
      const minEndDate =
        value.start && props?.maxDaysRange !== undefined
          ? formatForInput(new Date(value.start))
          : minStartDate || value.start
          ? formatForInput(new Date(value.start))
          : '';
      const endDateCandidates = [];
      if (props.maxNextDays !== undefined) {
        endDateCandidates.push(addDays(new Date(), props.maxNextDays));
      }
      if (props.maxDaysRange !== undefined && value.start) {
        endDateCandidates.push(
          addDays(new Date(value.start), props.maxDaysRange)
        );
      }
      const maxEndDate = endDateCandidates.length
        ? formatForInput(min(endDateCandidates))
        : maxStartDate;
      return [minStartDate, maxStartDate, minEndDate, maxEndDate];
    }, [props.maxSubDays, props.maxDaysRange, props.maxNextDays, value.start]);
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
          return valueRef.current.start || valueRef.current.end;
        },

        getModel() {
          if (!this.isFilterActive()) {
            return null;
          }

          return { value: valueRef.current };
        },

        setModel(model?: { value: DateRange } | null) {
          valueRef.current =
            model?.value || props?.defaultValue || defaultValue;
          setValue(valueRef.current);
        },
      };
    });
    const validate = (name: string, timeValue: Date, update?: DateRange) => {
      if (
        props.maxSubDays !== undefined &&
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
      if (props?.maxDaysRange !== undefined) {
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

    const checkForEndDate = (
      endDate: Date | undefined,
      startDate: Date | undefined
    ) => {
      const endDateCandidates: Date[] = [];
      if (props.maxDaysRange !== undefined && isValid(startDate)) {
        endDateCandidates.push(addDays(startDate as Date, props.maxDaysRange));
      }
      if (props.maxNextDays !== undefined) {
        endDateCandidates.push(addDays(Date.now(), props.maxNextDays));
      }
      if (isValid(endDate)) {
        endDateCandidates.push(endDate as Date);
      }
      return endDate && startDate
        ? formatRFC3339(max([startDate, min(endDateCandidates)]))
        : undefined;
    };
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value: dateValue, name } = event.target;
      const date = new Date(dateValue || defaultDates[name as 'start' | 'end']);
      let update = { [name]: isValid(date) ? formatRFC3339(date) : undefined };
      const startCheckDate = name === 'start' ? date : new Date(value.start);
      const endCheckDate =
        name === 'start'
          ? new Date(value.end)
          : isValid(date)
          ? date
          : new Date(maxEndDate);
      const endDate = isValid(endCheckDate) ? endCheckDate : undefined;
      const startDate = isValid(startCheckDate) ? startCheckDate : undefined;
      update = { ...update, end: checkForEndDate(endDate, startDate) };

      if (validate(name, date, update)) {
        valueRef.current = { ...valueRef.current, ...update };
        setValue(valueRef.current);
      }
    };
    useEffect(() => {
      props?.filterChangedCallback();
    }, [value, props]);

    const notification = useMemo(() => {
      const not = error ? <TradingInputError>{error}</TradingInputError> : null;
      return (
        <div className="ag-filter-apply-panel flex min-h-[2rem]">{not}</div>
      );
    }, [error]);

    const start = (value.start && formatForInput(new Date(value.start))) || '';
    const end = (value.end && formatForInput(new Date(value.end))) || '';
    return (
      <div className="ag-filter-body-wrapper inline-block min-w-fit">
        {notification}
        <div className="ag-filter-apply-panel">
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="start">
              <span className="mb-1 block">{t('Start')}</span>
              <input
                type="datetime-local"
                name="start"
                value={start || ''}
                onChange={onChange}
                min={minStartDate}
                max={maxStartDate}
              />
            </label>
          </fieldset>
          <fieldset className="ag-simple-filter-body-wrapper">
            <label className="block" key="end">
              <span className="mb-1 block">{t('End')}</span>
              <input
                type="datetime-local"
                name="end"
                value={end || ''}
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
              valueRef.current = defaultDates;
              setValue(valueRef.current);
            }}
          >
            {t('Reset')}
          </button>
        </div>
      </div>
    );
  }
);
