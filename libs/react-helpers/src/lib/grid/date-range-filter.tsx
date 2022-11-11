import type { ChangeEvent } from 'react';
import type { Schema as Types } from '@vegaprotocol/types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { isValidDate } from '../format/date';

const defaultFilterValue: Types.DateRange = {};

const toInputValue = (value: string) => {
  const date = new Date(value);
  if (!isValidDate(date)) {
    return;
  }
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${(
    date.getHours() + 1
  )
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const DateRangeFilter = forwardRef((props: IFilterParams, ref) => {
  const [value, setValue] = useState<Types.DateRange>(defaultFilterValue);

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

      setModel(model?: { value: Types.DateRange } | null) {
        setValue(model?.value || defaultFilterValue);
      },
    };
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue({
      ...value,
      [event.target.name]:
        event.target.value &&
        new Date(event.target.value).toISOString().replace('Z', '000000Z'),
    });
  };

  useEffect(() => {
    props.filterChangedCallback();
  }, [value]); //eslint-disable-line react-hooks/exhaustive-deps

  const start = (value.start && toInputValue(value.start)) || '';
  const end = (value.end && toInputValue(value.end)) || '';
  return (
    <div className="ag-filter-body-wrapper">
      <fieldset className="ag-simple-filter-body-wrapper">
        <label className="block" key="start">
          <span className="block">start</span>
          <input
            type="datetime-local"
            name="start"
            value={start}
            onChange={onChange}
          />
        </label>
        <label className="block" key="end">
          <span className="block">end</span>
          <input
            type="datetime-local"
            name="end"
            value={end}
            onChange={onChange}
          />
        </label>
      </fieldset>
      <div className="ag-filter-apply-panel">
        <button
          type="button"
          className="ag-standard-button ag-filter-apply-panel-button"
          onClick={() => setValue(defaultFilterValue)}
        >
          Reset
        </button>
      </div>
    </div>
  );
});
