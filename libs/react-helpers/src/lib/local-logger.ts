import * as Sentry from '@sentry/browser';
import type { SeverityLevel, Scope } from '@sentry/browser';
import type { Severity, Breadcrumb, Primitive } from '@sentry/types';

type ConsoleArg = string | number | boolean | bigint | symbol | object;
type ConsoleMethod = {
  [K in keyof Console]: Console[K] extends (...args: ConsoleArg[]) => any
    ? K
    : never;
}[keyof Console] &
  string;

interface LoggerConf {
  application?: string;
  tags?: string[];
  logLevel?: SeverityLevel;
}

const isPrimitive = (arg: ConsoleArg | undefined | null): arg is Primitive => {
  return ['string', 'number', 'boolean', 'bigint', 'symbol'].includes(
    typeof arg
  );
};

export class LocalLogger {
  static levelLogMap = {
    debug: 10,
    info: 20,
    log: 30,
    warning: 40,
    error: 50,
    critical: 60,
    fatal: 70,
    silent: 80,
  };
  private _logLevel: SeverityLevel = 'info';
  private get numberLogLevel() {
    return LocalLogger.levelLogMap[this._logLevel];
  }
  private tags: string[] = [];
  private application = 'trading';
  constructor(conf: LoggerConf) {
    if (conf.application) {
      this.application = conf.application;
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
    level: SeverityLevel,
    logMethod: ConsoleMethod,
    args: ConsoleArg[]
  ) {
    if (this.numberLogLevel <= LocalLogger.levelLogMap[level]) {
      console[logMethod].apply(console, [
        `${this.application}:${level}: `,
        ...args,
      ]);
      this._transmit(level, args);
    }
  }
  private _extractArgs(
    level: SeverityLevel,
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
          if (typeof arg === 'object' && tag in arg) {
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
  private _transmit(level: SeverityLevel, args: ConsoleArg[]) {
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
  public setLogLevel(logLevel: SeverityLevel) {
    this._logLevel = logLevel;
  }
  public get logLevel() {
    return this._logLevel;
  }
}

let singleLoggerInstance: LocalLogger;

export const localLoggerFactory = (conf: LoggerConf) => {
  if (!singleLoggerInstance) {
    singleLoggerInstance = new LocalLogger(conf);
  }
  if (conf.logLevel && singleLoggerInstance.logLevel !== conf.logLevel) {
    singleLoggerInstance.setLogLevel(conf.logLevel);
  }
  return singleLoggerInstance;
};
