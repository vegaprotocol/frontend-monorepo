import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  isNumeric,
} from './number';

export const formatValue = (
  value: string | number | null | undefined,
  formatDecimals: number,
  quantum?: string,
  emptyValue = '-'
): string => {
  if (!isNumeric(value)) return emptyValue;
  if (!quantum) return addDecimalsFormatNumber(value, formatDecimals);
  return addDecimalsFormatNumberQuantum(value, formatDecimals, quantum);
};

export const formatRange = (
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  formatDecimals: number,
  quantum?: string,
  emptyValue = '-'
) => {
  const minFormatted = formatValue(min, formatDecimals, quantum);
  const maxFormatted = formatValue(max, formatDecimals, quantum);
  if (minFormatted !== maxFormatted) {
    return `${minFormatted} - ${maxFormatted}`;
  }
  if (minFormatted !== emptyValue) {
    return minFormatted;
  }
  return maxFormatted;
};
