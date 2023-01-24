import * as Sentry from '@sentry/browser';
import type { Severity } from '@sentry/types/types/severity';
import { LocalLogger, localLoggerFactory } from './local-logger';

type LoggerMethodsType =
  | 'silent'
  | 'debug'
  | 'info'
  | 'log'
  | 'warn'
  | 'error'
  | 'critical'
  | 'fatal';
type ConsoleMethodType = jest.FunctionPropertyNames<Console>;

describe('LocalLogger', () => {
  const methods = [
    'silent',
    'debug',
    'info',
    'log',
    'warn',
    'error',
    'critical',
    'fatal',
  ] as LoggerMethodsType[];
  it('logger should be properly instantiate', () => {
    const logger = localLoggerFactory({});
    expect(logger).toBeInstanceOf(LocalLogger);
    methods.forEach((method) => {
      expect(logger[method]).toBeDefined();
    });
  });

  it('each method should call console', () => {
    const methodToConsoleMethod = [
      'log',
      'debug',
      'info',
      'log',
      'warn',
      'error',
      'error',
      'error',
    ] as ConsoleMethodType[];
    const methodToLevel = [
      'silent',
      'debug',
      'info',
      'log',
      'warning',
      'error',
      'critical',
      'fatal',
    ];
    const logger = localLoggerFactory({});
    methods.forEach((method, i) => {
      const consoleMethod = methodToConsoleMethod[i];
      jest.spyOn(console, consoleMethod);
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
    const logger = localLoggerFactory({});
    methods.forEach((method, i) => {
      logger[method]('test', 'test2');

      /* eslint-disable jest/no-conditional-expect */
      if (i === 0) {
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
        expect(Sentry.captureException).not.toHaveBeenCalled();
      } else if (i < 5) {
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
});
