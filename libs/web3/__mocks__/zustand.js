import { act } from '@testing-library/react';
const zu = jest.requireActual('zustand'); // if using jest

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set();

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = (createState) => {
  let store;
  if (typeof createState === 'function') {
    store = zu.create(createState);
  } else {
    store = (selector, equalityFn) =>
      zu.useStore(createState, selector, equalityFn);
    Object.assign(store, createState);
  }
  const initialState = store.getState();
  storeResetFns.add(() => store.setState(initialState, true));
  return store;
};

// Reset all stores after each test run
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()));
});

export default create;
