export const getRowClass = (params) => {
  if (params.node.rowIndex % 2 === 0) {
    return 'my-shaded-effect';
  }
};

export const rowClassRules = {
  // apply green to 2008
  'rag-green-outer': function (params) {
    return params.data.year === 2008;
  },

  // apply amber 2004
  'rag-amber-outer': function (params) {
    return params.data.year === 2004;
  },

  // apply red to 2000
  'rag-red-outer': function (params) {
    return params.data.year === 2000;
  },
};
