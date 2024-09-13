export async function install({ settings }) {
  await Promise.allSettled([
    settings.set('autoOpen', true),
    settings.set('autoConsent', false),
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
      // TODO: leaking event listeners here
      window.addEventListener(name, (message) => {
        callback(message.detail);
      });
    },
    removeListener: (callback) => {
      window.removeEventListener(name, callback);
    },
  },
  onDisconnect: {
    addListener: (callback) => {},
    removeListener: (callback) => {},
  },
});

export const setupListeners = (
  settings,
  clientPorts,
  popupPorts,
  interactor
) => {
  install({ settings });
  popupPorts.listen(createPortMock('popup'));
  clientPorts.listen(createPortMock('content-script'));
  interactor.connect(createPortMock('popup'));
};
