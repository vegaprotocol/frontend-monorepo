import * as Sentry from '@sentry/browser';
import type { SeverityLevel, Scope } from '@sentry/browser';
import type { Severity, Breadcrumb, Primitive } from '@sentry/types';

type ConsoleArg = string | number | boolean | bigint | symbol | object;
type ConsoleArgs = ConsoleArg[];

interface LoggerConf {
  application?: string;
  tags?: string[];
}

const isPrimitive = (arg: ConsoleArg | undefined | null): arg is Primitive => {
  return ['string', 'number', 'boolean', 'bigint', 'symbol'].includes(
    typeof arg
  );
};

export class LocalLogger {
  tags: string[] = [];
  application = 'trading';
  constructor(conf: LoggerConf) {
    if (conf.application) {
      this.application = conf.application;
    }
    this.tags = [...(conf.tags || [])];
  }
  public silent(...args: ConsoleArgs) {
    console.log.apply(console, [`${this.application}:silent: `, ...args]);
  }
  public debug(...args: ConsoleArgs) {
    console.debug.apply(console, [`${this.application}:debug: `, ...args]);
    this._transmit('debug', args);
  }
  public info(...args: ConsoleArgs) {
    console.info.apply(console, [`${this.application}:info: `, ...args]);
    this._transmit('info', args);
  }
  public log(...args: ConsoleArgs) {
    console.log.apply(console, [`${this.application}:log: `, ...args]);
    this._transmit('log', args);
  }
  public warn(...args: ConsoleArgs) {
    console.warn.apply(console, [`${this.application}:warning: `, ...args]);
    this._transmit('warning', args);
  }
  public error(...args: ConsoleArgs) {
    console.error.apply(console, [`${this.application}:error: `, ...args]);
    this._transmit('error', args);
  }
  public critical(...args: ConsoleArgs) {
    console.error.apply(console, [`${this.application}:critical: `, ...args]);
    this._transmit('critical', args);
  }
  public fatal(...args: ConsoleArgs) {
    console.error.apply(console, [`${this.application}:fatal: `, ...args]);
    this._transmit('fatal', args);
  }
  private _extractArgs(
    level: SeverityLevel,
    args: ConsoleArgs
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
  private _transmit(level: SeverityLevel, args: ConsoleArgs) {
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
}

let singleLoggerInstance: LocalLogger;

export const localLoggerFactory = (conf: LoggerConf) => {
  if (!singleLoggerInstance) {
    singleLoggerInstance = new LocalLogger(conf);
  }
  return singleLoggerInstance;
};
