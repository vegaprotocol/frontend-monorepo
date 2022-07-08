import { useEffect } from 'react';
import type { RefObject } from 'react';

interface Props<T> {
  ref: RefObject<T>;
  func: () => void;
}

export const useOutsideClick = <T extends HTMLElement>({
  ref,
  func,
}: Props<T>) => {
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        func();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, func]);
};
