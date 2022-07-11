import { useEffect } from 'react';
import type { RefObject } from 'react';

interface Props {
  refs: RefObject<HTMLElement>[];
  func: (event: Event) => void;
}

export const useOutsideClick = ({ refs, func }: Props) => {
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const found = refs.reduce((agg: boolean, item) => {
        if (item.current && item.current.contains(event.target as Node)) {
          agg = true;
        }
        return agg;
      }, false);
      if (!found) {
        func(event);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, func]);
};
