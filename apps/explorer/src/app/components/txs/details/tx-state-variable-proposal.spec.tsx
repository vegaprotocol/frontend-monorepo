import {
  hackyGetMarketFromStateVariable,
  hackyGetVariableFromStateVariable,
} from './tx-state-variable-proposal';

describe('Hacky Get market from state variable', () => {
  it('Extracts a market id from a known state variable proposal id', () => {
    const knownId =
      '84fff099818dc4f5319477f0812b4341565cfb32ccf735beede734e386b8108f_5d69ff4a485a9f963272c8614c1d0d84bb8ea57886f5b11aad53f0ccc77731ba_probability_of_trading';
    const res = hackyGetMarketFromStateVariable(knownId);
    expect(res).toEqual(
      '5d69ff4a485a9f963272c8614c1d0d84bb8ea57886f5b11aad53f0ccc77731ba'
    );
  });

  it('Returns null if the string looks a bit like the known one, but with different segments', () => {
    const knownId =
      '5d69ff4a485a9f963272c8614c1d0d84bb8ea57886f5b11aad53f0ccc77731ba_probability_of_trading';
    const res = hackyGetMarketFromStateVariable(knownId);
    expect(res).toEqual(null);
  });

  it('Handles empty/weird data', () => {
    expect(hackyGetMarketFromStateVariable(null as unknown as string)).toEqual(
      null
    );
    expect(hackyGetMarketFromStateVariable('')).toEqual(null);
    expect(
      hackyGetMarketFromStateVariable(undefined as unknown as string)
    ).toEqual(null);
    expect(hackyGetMarketFromStateVariable(2 as unknown as string)).toEqual(
      null
    );
  });
});

describe('Hacky Get Variable from state variable proposal id', () => {
  it('Extracts an variable name from a known state variable proposal id', () => {
    const knownId =
      '84fff099818dc4f5319477f0812b4341565cfb32ccf735beede734e386b8108f_5d69ff4a485a9f963272c8614c1d0d84bb8ea57886f5b11aad53f0ccc77731ba_probability_of_trading';
    const res = hackyGetVariableFromStateVariable(knownId);
    expect(res).toEqual('probability of trading');
  });

  it('Handles empty/weird data', () => {
    expect(
      hackyGetVariableFromStateVariable(null as unknown as string)
    ).toEqual(null);
    expect(hackyGetVariableFromStateVariable('')).toEqual(null);
    expect(
      hackyGetVariableFromStateVariable(undefined as unknown as string)
    ).toEqual(null);
    expect(hackyGetVariableFromStateVariable(2 as unknown as string)).toEqual(
      null
    );
  });
});
