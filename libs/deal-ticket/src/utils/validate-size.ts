export const ERROR_SIZE_DECIMAL = 'step';

export const validateSize = (step: number) => {
  const [_, stepDecimals = ''] = String(step).split('.');
  return (value: string) => {
    const [_, valueDecimals = ''] = value.split('.');
    if (stepDecimals.length < valueDecimals.length) {
      return ERROR_SIZE_DECIMAL;
    }
    return true;
  };
};
