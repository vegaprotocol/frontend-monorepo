import { LocalLogger, localLoggerFactory } from './local-logger';

const methods = [
  'debug',
  'info',
  'log',
  'warn',
  'error',
  'critical',
  'fatal',
] as const;
const methodToConsoleMethod = [
  'debug',
  'info',
  'log',
  'warn',
  'error',
  'error',
  'error',
] as const;

describe('LocalLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logger should be properly instantiate', () => {
    const logger = localLoggerFactory({});
    expect(logger).toBeInstanceOf(LocalLogger);
    methods.forEach((method) => {
      expect(logger[method]).toBeDefined();
    });
  });

  it('each method should call console', () => {
    const methodToLevel = [
      'debug',
      'info',
      'log',
      'warning',
      'error',
      'critical',
      'fatal',
    ];
    const logger = localLoggerFactory({ logLevel: 'debug' });
    methods.forEach((method, i) => {
      const consoleMethod = methodToConsoleMethod[i];
      jest.spyOn(console, consoleMethod).mockImplementation();
      logger[method]('test', 'test2');
      // eslint-disable-next-line no-console
      expect(console[consoleMethod]).toHaveBeenCalledWith(
        `trading:${methodToLevel[i]}:`,
        'test',
        'test2'
      );
      jest.clearAllMocks();
    });
  });

  it('setLogLevel should change log level', () => {
    const logger = localLoggerFactory({ logLevel: 'info' });
    jest.spyOn(console, 'debug').mockImplementation();
    logger.debug('test', 'test1');

    // eslint-disable-next-line no-console
    expect(console.debug).not.toHaveBeenCalled();

    logger.setLogLevel('debug');
    logger.debug('test', 'test1');

    // eslint-disable-next-line no-console
    expect(console.debug).toHaveBeenCalledWith(
      'trading:debug:',
      'test',
      'test1'
    );
  });
});
