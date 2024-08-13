// import { createWindow } from '../src/windows.js';
// import { disconnect, removeListener } from 'process';
import config from '../../config/beta.js';

export async function install({ networks, settings }) {
  await Promise.allSettled([
    ...config.networks.map((network) => networks.set(network.id, network)),
    settings.set('selectedNetwork', config.defaultNetworkId),
    settings.set('autoOpen', true),
    settings.set('showHiddenNetworks', false),
    settings.set('version', 0),
  ]);
}

const createPortMock = (name) => ({
  postMessage: (message) => {
    window.dispatchEvent(
      new CustomEvent(`${name}-response`, { detail: message })
    );
  },
  disconnect: () => {
    // eslint-disable-next-line no-console
    console.log('disconnect');
  },
  onMessage: {
    addListener: (callback) => {
      window.addEventListener(name, (message) => {
        callback(message.detail);
      });
    },
    removeListener: (callback) => {
      window.removeEventListener(name, callback);
    },
  },
  onDisconnect: {
    addListener: (callback) => {
      // eslint-disable-next-line no-console
      console.log('onMessage addListener', callback);
    },
    removeListener: (callback) => {
      // eslint-disable-next-line no-console
      console.log('onMessage removeListener', callback);
    },
  },
});

export const setupListeners = (
  networks,
  settings,
  clientPorts,
  popupPorts,
  interactor,
  connections,
  keySortIndex,
  wallets
) => {
  // TODO only run once not on every setup
  install({ networks, settings });
  popupPorts.listen(createPortMock('popup'));
  clientPorts.listen(createPortMock('content-script'));
  interactor.connect(createPortMock('popup'));
};
