import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  isNumeric,
} from './number';

export const formatValue = (
  value: string | number | null | undefined,
  decimalPlaces: number,
  quantum?: string,
  formatDecimals?: number,
  emptyValue = '-'
): string => {
  if (!isNumeric(value)) return emptyValue;
  if (!quantum) {
    return addDecimalsFormatNumber(value, decimalPlaces, formatDecimals);
  }
  return addDecimalsFormatNumberQuantum(value, decimalPlaces, quantum);
};

export const formatRange = (
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  decimalPlaces: number,
  quantum?: string,
  formatDecimals?: number,
  emptyValue = '-'
) => {
  const minFormatted = formatValue(min, decimalPlaces, quantum, formatDecimals);
  const maxFormatted = formatValue(max, decimalPlaces, quantum, formatDecimals);
  if (minFormatted !== maxFormatted) {
    return `${minFormatted} - ${maxFormatted}`;
  }
  if (minFormatted !== emptyValue) {
    return minFormatted;
  }
  return maxFormatted;
};
