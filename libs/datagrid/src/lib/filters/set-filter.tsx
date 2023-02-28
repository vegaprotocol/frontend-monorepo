import type { ChangeEvent } from 'react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { t } from '@vegaprotocol/i18n';

export const SetFilter = forwardRef((props: IFilterParams, ref) => {
  const [value, setValue] = useState<string[]>([]);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      doesFilterPass(params: IDoesFilterPassParams) {
        const { api, colDef, column, columnApi, context } = props;
        const { node } = params;
        const getValue = props.valueGetter({
          api,
          colDef,
          column,
          columnApi,
          context,
          data: node.data,
          getValue: (field) => node.data[field],
          node,
        });
        return Array.isArray(value)
          ? value.includes(getValue)
          : getValue === value;
      },

      isFilterActive() {
        return value.length !== 0;
      },

      getModel() {
        if (!this.isFilterActive()) {
          return null;
        }

        return { value };
      },

      setModel(model?: { value: string[] } | null) {
        setValue(!model ? [] : model.value);
      },
    };
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(
      event.target.checked
        ? [...value, event.target.value]
        : value.filter((v) => v !== event.target.value)
    );
  };

  useEffect(() => {
    props.filterChangedCallback();
  }, [value]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ag-filter-body-wrapper">
      <fieldset className="ag-simple-filter-body-wrapper">
        {Object.keys(props.colDef.filterParams.set).map((key) => (
          <label className="flex">
            <input
              type="checkbox"
              key={key}
              value={key}
              className="mr-1"
              checked={value.includes(key)}
              onChange={onChange}
            />
            <span>{props.colDef.filterParams.set[key]}</span>
          </label>
        ))}
      </fieldset>
      <div className="ag-filter-apply-panel">
        <button
          type="button"
          className="ag-standard-button ag-filter-apply-panel-button"
          onClick={() => setValue([])}
        >
          {t('Reset')}
        </button>
      </div>
    </div>
  );
});
