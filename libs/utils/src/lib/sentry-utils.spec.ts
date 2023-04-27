import * as Sentry from '@sentry/nextjs';
import { SentryInit, SentryClose } from './sentry-utils';

jest.mock('@sentry/nextjs');

describe('Sentry utlis', () => {
  describe('SentryInit', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize', () => {
      SentryInit('sentry.dsn');
      expect(Sentry.init).toHaveBeenCalled();
    });
    it('should do nothing', () => {
      SentryInit('');
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should close', () => {
      SentryClose();
      expect(Sentry.close).toHaveBeenCalled();
    });
  });
});
