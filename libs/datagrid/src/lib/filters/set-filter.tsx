import type { ChangeEvent } from 'react';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import type { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { useT } from '../use-t';

export const SetFilter = forwardRef(
  (props: IFilterParams & { readonly?: boolean }, ref) => {
    const t = useT();
    const [value, setValue] = useState<string[]>([]);
    const valueRef = useRef(value);
    const { readonly } = props;
    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
      return {
        doesFilterPass(params: IDoesFilterPassParams) {
          const { column } = props;
          const { node } = params;
          const getValue = props.getValue(node, column);
          return Array.isArray(value)
            ? value.includes(getValue)
            : getValue === value;
        },

        isFilterActive() {
          return valueRef.current.length !== 0;
        },

        getModel() {
          if (!this.isFilterActive()) {
            return null;
          }
          return { value: valueRef.current };
        },

        setModel(model?: { value: string[] } | null) {
          valueRef.current = !model ? [] : model.value;
          setValue(valueRef.current);
        },
      };
    });

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      valueRef.current = event.target.checked
        ? [...value, event.target.value]
        : value.filter((v) => v !== event.target.value);
      setValue(valueRef.current);
    };

    useEffect(() => {
      props.filterChangedCallback();
    }, [value]); //eslint-disable-line react-hooks/exhaustive-deps
    return (
      <div className="ag-filter-body-wrapper">
        <fieldset className="ag-simple-filter-body-wrapper">
          {Object.keys(props.colDef.filterParams.set).map((key) => (
            <label className="flex" key={key}>
              <input
                type="checkbox"
                value={key}
                disabled={readonly}
                className="mr-1"
                checked={value.includes(key)}
                onChange={onChange}
              />
              <span>{props.colDef.filterParams.set[key]}</span>
            </label>
          ))}
        </fieldset>
        {!readonly && (
          <div className="ag-filter-apply-panel">
            <button
              type="button"
              disabled={readonly}
              className="ag-standard-button ag-filter-apply-panel-button"
              onClick={() => setValue((valueRef.current = []))}
            >
              {t('Reset')}
            </button>
          </div>
        )}
      </div>
    );
  }
);
