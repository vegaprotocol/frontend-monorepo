import { useState } from 'react';
import { LocalStorage } from '../lib/storage';

const CLOSED = 'closed';
const OPEN = 'open';
const SELECT_MARKET_MODAL = 'selectMarketModal';

type modalVariant = typeof CLOSED | typeof OPEN;

export const getCurrentModal = (): modalVariant => {
  const modal = LocalStorage.getItem(SELECT_MARKET_MODAL);
  if (modal) {
    return modal === CLOSED ? CLOSED : OPEN;
  } else {
    LocalStorage.setItem(SELECT_MARKET_MODAL, OPEN);
    return OPEN;
  }
};

export const toggleModal = () => {
  const modal = getCurrentModal() === CLOSED ? OPEN : CLOSED;
  LocalStorage.setItem(SELECT_MARKET_MODAL, modal);
  return modal;
};

export function useModalSwitcher(): [modalVariant, () => void] {
  const [modal, setModal] = useState<modalVariant>(getCurrentModal());
  return [modal, () => setModal(toggleModal)];
}
