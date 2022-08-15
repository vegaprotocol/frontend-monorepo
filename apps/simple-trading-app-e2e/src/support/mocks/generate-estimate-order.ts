export const generateEstimateOrder = () => {
  return {
    estimateOrder: {
      fee: {
        __typename: 'TradeFee',
        marketFee: '100000.000',
        liquidityFee: '100000.000',
        infrastructureFee: '100000.000',
      },
      marginLevels: {
        initialLevel: '2844054.80937741220203',
        __typename: 'MarginLevels',
      },
      __typename: 'OrderEstimate',
    },
  };
};
