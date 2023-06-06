import * as Sentry from '@sentry/react';
import type { Severity } from '@sentry/types/types/severity';
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
      expect(console[consoleMethod]).toHaveBeenCalledWith(
        `trading:${methodToLevel[i]}: `,
        'test',
        'test2'
      );
      jest.clearAllMocks();
    });
  });

  it('each method should call sentry', () => {
    jest.spyOn(Sentry, 'captureMessage');
    jest.spyOn(Sentry, 'captureException');
    const logger = localLoggerFactory({ logLevel: 'debug' });
    methods.forEach((method, i) => {
      jest.spyOn(console, methodToConsoleMethod[i]).mockImplementation();
      logger[method]('test', 'test2');
      /* eslint-disable jest/no-conditional-expect */
      if (i < 4) {
        expect(Sentry.captureMessage).toHaveBeenCalled();
        expect(Sentry.captureException).not.toHaveBeenCalled();
      } else {
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
        expect(Sentry.captureException).toHaveBeenCalled();
        /* eslint-enable jest/no-conditional-expect */
      }
      jest.clearAllMocks();
    });
  });

  it('breadcrumb method should call Sentry', () => {
    const logger = localLoggerFactory({});
    jest.spyOn(Sentry, 'addBreadcrumb');
    const breadCrumb = {
      type: 'type',
      level: 'fatal' as Severity,
      event_id: 'event_id',
      category: 'category',
      message: 'message',
      data: {
        data_1: 'data_1',
        data_2: 'data_2',
      },
      timestamp: 1111111,
    };
    logger.addSentryBreadcrumb(breadCrumb);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadCrumb);
  });

  it('setLogLevel should change log level', () => {
    const logger = localLoggerFactory({ logLevel: 'info' });
    jest.spyOn(console, 'debug').mockImplementation();
    logger.debug('test', 'test1');
    expect(console.debug).not.toHaveBeenCalled();

    logger.setLogLevel('debug');
    logger.debug('test', 'test1');
    expect(console.debug).toHaveBeenCalledWith(
      'trading:debug: ',
      'test',
      'test1'
    );
  });
});
