import { render, screen } from '@testing-library/react';
import React from 'react';

import { MarketExpires } from './market-expires';

jest.mock('./format', () => ({
  getDateTimeFormat: () =>
    Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
}));

jest.mock('./i18n', () => ({
  t: jest.fn().mockImplementation((text) => text),
}));

describe('MarketExpires', () => {
  describe('should properly parse different tags', () => {
    it('settlement:date', () => {
      const tags = [
        'foo:buzz',
        'test:20220625T1200',
        'settlement',
        'settlement:notadate',
        'settlement:20220525T1200',
      ];
      render(<MarketExpires tags={tags} />);
      expect(screen.getByText('25/05/2022, 12:00:00')).toBeInTheDocument();
    });

    it('settlement-date:date', () => {
      const tags = [
        'settlement',
        'settlement:20220525T1200',
        'settlement-date:2022-04-25T1200',
      ];
      render(<MarketExpires tags={tags} />);
      expect(screen.getByText('25/04/2022, 12:00:00')).toBeInTheDocument();
    });

    it('last one proper tag should matter', () => {
      const tags = [
        'settlement',
        'settlement-date:20220525T1200',
        'settlement-expiry-date:2022-03-25T12:00:00',
      ];
      render(<MarketExpires tags={tags} />);
      expect(screen.getByText('25/03/2022, 12:00:00')).toBeInTheDocument();
    });

    it('when no proper tag nor date should be null', () => {
      const tags = [
        'settlement',
        'settlemenz:20220525T1200',
        'settlemenx-date:20220425T1200',
      ];
      const { container } = render(<MarketExpires tags={tags} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
