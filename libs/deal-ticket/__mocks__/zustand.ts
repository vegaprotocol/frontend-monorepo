import type { StateCreator } from 'zustand';
import { act } from 'react-dom/test-utils';
const { create: actualCreate, useStore: actualUseStore } =
  jest.requireActual('zustand'); // if using jest

// a variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set<() => void>();

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create =
  () =>
  <S>(createState: StateCreator<S>) => {
    const store = actualCreate(createState);
    const initialState = store.getState();
    storeResetFns.add(() => store.setState(initialState, true));
    return store;
  };

export const createStore = create;
export const useStore = actualUseStore;

// Reset all stores after each test run
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()));
});

// also export default as web3-react internals import and use zustand as the default import
export default create;
