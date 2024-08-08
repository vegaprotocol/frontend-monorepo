import 'jest-webextension-mock'

const window = {
  alwaysOnTop: false,
  focused: false,
  height: 800,
  id: Math.floor(Math.random() * 10000),
  incognito: false,
  left: 258,
  state: 'normal',
  top: 25,
  type: 'normal',
  width: 742
}

const popout = {
  alwaysOnTop: false,
  focused: false,
  height: 800,
  id: Math.floor(Math.random() * 10000),
  incognito: false,
  left: 258,
  state: 'normal',
  top: 25,
  type: 'popout',
  width: 742
}

const windows = {
  create: jest.fn().mockResolvedValue(() => popout),
  get: jest.fn(),
  getAll: jest.fn(),
  getCurrent: jest.fn().mockResolvedValue(() => window),
  getLastFocused: jest.fn(() => window),
  remove: jest.fn(),
  update: jest.fn(),
  onBoundsChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  },
  onCreated: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  },
  onFocusChanged: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  },
  onRemoved: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
}

global.chrome = {
  ...global.chrome,
  windows
}
global.browser = {
  ...global.browser,
  windows
}
