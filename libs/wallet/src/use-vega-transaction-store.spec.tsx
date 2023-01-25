import type { StateCreator } from 'zustand';
import { create as actualCreate } from 'zustand';
// const actualCreate = jest.requireActual('zustand') // if using jest
import { act } from 'react-dom/test-utils';

// a variable to hold reset functions for all stores declared in the app
let reset: () => void;

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create =
  () =>
  <S,>(createState: StateCreator<S>) => {
    const store = actualCreate<S>(createState);
    const initialState = store.getState();
    reset = () => store.setState(initialState, true);
    return store;
  };

// Reset all stores after each test run
beforeEach(() => {
  act(() => reset());
});
