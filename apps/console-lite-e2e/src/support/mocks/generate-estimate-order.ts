export const generateEstimateOrder = () => {
  return {
    estimateOrder: {
      fee: {
        __typename: 'TradeFee',
        makerFee: '100000',
        liquidityFee: '100000',
        infrastructureFee: '100000',
      },
      marginLevels: {
        initialLevel: '2844054.80937741220203',
        __typename: 'MarginLevels',
      },
      __typename: 'OrderEstimate',
    },
  };
};
