import React from "react";

import { LocalStorage } from "../lib/storage";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    const item = LocalStorage.getItem(key);

    // If item is null nothing was found in localStorage so use the initial value
    return item !== null ? item : initialValue;
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((currValue: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    LocalStorage.setItem(key, value);
  };

  return [storedValue, setValue];
}
