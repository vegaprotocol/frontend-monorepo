import * as Sentry from '@sentry/react';
import type { Scope } from '@sentry/browser';
import type { Severity, Breadcrumb, Primitive } from '@sentry/types';

declare global {
  // eslint-disable-next-line no-var
  var __LOGGER_SILENT_MODE__: boolean;
}

const LogLevels = [
  'fatal',
  'error',
  'warning',
  'log',
  'info',
  'debug',
  'critical',
  'silent',
];
type LogLevelsType = typeof LogLevels[number];
type ConsoleArg =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | object
  | unknown;
type ConsoleMethod = {
  [K in keyof Console]: Console[K] extends (...args: ConsoleArg[]) => unknown
    ? K
    : never;
}[keyof Console] &
  string;

export interface LoggerConf {
  application?: string;
  tags?: string[];
  logLevel?: LogLevelsType;
}

const isPrimitive = (arg: ConsoleArg | undefined | null): arg is Primitive => {
  return ['string', 'number', 'boolean', 'bigint', 'symbol'].includes(
    typeof arg
  );
};

export class LocalLogger {
  static levelLogMap: Record<LogLevelsType, number> = {
    debug: 10,
    info: 20,
    log: 30,
    warning: 40,
    error: 50,
    critical: 60,
    fatal: 70,
    silent: 80,
  };
  private _logLevel: LogLevelsType = 'info';
  private get numberLogLevel() {
    return LocalLogger.levelLogMap[this._logLevel];
  }
  private tags: string[] = [];
  private _application = 'trading';
  constructor(conf: LoggerConf) {
    if (conf.application) {
      this._application = conf.application;
    }
    this.tags = [...(conf.tags || [])];
    this._logLevel = conf.logLevel || this._logLevel;
  }
  public debug(...args: ConsoleArg[]) {
    this._log('debug', 'debug', args);
  }
  public info(...args: ConsoleArg[]) {
    this._log('info', 'info', args);
  }
  public log(...args: ConsoleArg[]) {
    this._log('log', 'log', args);
  }
  public warn(...args: ConsoleArg[]) {
    this._log('warning', 'warn', args);
  }
  public error(...args: ConsoleArg[]) {
    this._log('error', 'error', args);
  }
  public critical(...args: ConsoleArg[]) {
    this._log('critical', 'error', args);
  }
  public fatal(...args: ConsoleArg[]) {
    this._log('fatal', 'error', args);
  }
  private _log(
    level: LogLevelsType,
    logMethod: ConsoleMethod,
    args: ConsoleArg[]
  ) {
    if (
      this.numberLogLevel <= LocalLogger.levelLogMap[level] &&
      !global.__LOGGER_SILENT_MODE__
    ) {
      console[logMethod].apply(console, [
        `${this._application}:${level}: `,
        ...args,
      ]);
    }
    this._transmit(level, args);
  }
  private _extractArgs(
    level: LogLevelsType,
    args: ConsoleArg[]
  ): [string, Error, Scope] {
    const arg = args.shift();
    const error = arg instanceof Error ? arg : null;
    const msg = error ? error.message : String(arg);
    const scope = new Sentry.Scope();
    scope.setLevel(level as Severity);
    let logArgs: Record<string, unknown>;
    try {
      logArgs = { args: JSON.stringify(args) };
    } catch (e) {
      logArgs = { args };
    }
    scope.setContext('event-record', logArgs);
    if (this.tags.length) {
      this.tags.forEach((tag) => {
        const found = args.reduce((aggr, arg) => {
          if (arg && typeof arg === 'object' && tag in arg) {
            // @ts-ignore change object to record
            aggr = arg[tag] as unknown as Primitive | object;
          }
          return aggr;
        }, null as Primitive | object);
        if (isPrimitive(found)) {
          scope.setTag(tag, found);
        }
      });
    }
    return [msg, error || new Error(msg), scope];
  }
  private _transmit(level: LogLevelsType, args: ConsoleArg[]) {
    const [msg, error, logEvent] = this._extractArgs(level, args);
    switch (level) {
      case 'debug':
      case 'info':
      case 'log':
      case 'warning':
        Sentry.captureMessage(msg, logEvent);
        return;
      case 'error':
      case 'critical':
      case 'fatal':
        Sentry.captureException(error, logEvent);
        return;
    }
  }
  public addSentryBreadcrumb(breadcrumb: Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }
  public setLogLevel(logLevel: LogLevelsType) {
    this._logLevel = logLevel;
  }
  public get logLevel() {
    return this._logLevel;
  }
  public get application() {
    return this._application;
  }
}

let singleLoggerInstances: LocalLogger[];

export const localLoggerFactory = (conf: LoggerConf) => {
  if (!singleLoggerInstances) {
    singleLoggerInstances = [];
  }
  let singleLoggerInstance = singleLoggerInstances.find(
    (instance) => instance.application === conf.application
  );
  if (!singleLoggerInstance) {
    singleLoggerInstance = new LocalLogger(conf);
    singleLoggerInstances.push(singleLoggerInstance);
  }
  if (conf.logLevel && singleLoggerInstance.logLevel !== conf.logLevel) {
    singleLoggerInstance.setLogLevel(conf.logLevel);
  }
  return singleLoggerInstance;
};
