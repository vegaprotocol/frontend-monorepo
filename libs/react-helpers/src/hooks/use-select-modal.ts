import { useState } from 'react';
import { LocalStorage } from '../lib/storage';

const closedModal = 'closed';
const openModal = 'open';
type modalVariant = typeof closedModal | typeof openModal;

const getCurrentModal = () => {
  const modal = LocalStorage.getItem('modal');
  return modal === closedModal ? closedModal : openModal;
};

const toggleModal = () => {
  const modal =
    LocalStorage.getItem('modal') === closedModal ? openModal : closedModal;
  LocalStorage.setItem('modal', modal);
  return modal;
};

export function useModalSwitcher(): [modalVariant, () => void] {
  const [modal, setModal] = useState<modalVariant>(getCurrentModal());
  return [modal, () => setModal(toggleModal)];
}
