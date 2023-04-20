import * as Sentry from '@sentry/nextjs';
import { SentryInit, SentryClose } from './sentry-utils';
import * as constants from '../config';

jest.mock('@sentry/nextjs');

describe('Sentry utlis', () => {
  constants.ENV.dsn = 'sentry.dsn';
  describe('SentryInit', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize', () => {
      SentryInit();
      expect(Sentry.init).toHaveBeenCalled();
    });
    it('should do nothing', () => {
      constants.ENV.dsn = '';
      SentryInit();
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should close', () => {
      SentryClose();
      expect(Sentry.close).toHaveBeenCalled();
    });
  });
});
