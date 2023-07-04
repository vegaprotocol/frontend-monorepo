import * as Sentry from '@sentry/react';
import { SentryInit, SentryClose } from './sentry-utils';

jest.mock('@sentry/react');

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
