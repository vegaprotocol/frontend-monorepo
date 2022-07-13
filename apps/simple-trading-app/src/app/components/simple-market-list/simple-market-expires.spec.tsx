import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleMarketExpires from './simple-market-expires';

describe('SimpleMarketExpires', () => {
  describe('should properly parse different tags', () => {
    it('settlement:date', () => {
      const tags = [
        'foo:buzz',
        'test:20220625T1200',
        'settlement',
        'settlement:notadate',
        'settlement:20220525T1200',
      ];
      render(<SimpleMarketExpires tags={tags} />);
      expect(screen.getByText('May 25')).toBeInTheDocument();
    });

    it('settlement-date:date', () => {
      const tags = [
        'settlement',
        'settlement:20220525T1200',
        'settlement-date:2022-04-25T1200',
      ];
      render(<SimpleMarketExpires tags={tags} />);
      expect(
        screen.getByText('April 25')
      ).toBeInTheDocument();
    });

    it('last one proper tag should matter', () => {
      const tags = [
        'settlement',
        'settlement-date:20220525T1200',
        'settlement-expiry-date:2022-03-25T12:00:00',
      ];
      render(<SimpleMarketExpires tags={tags} />);
      expect(
        screen.getByText('March 25')
      ).toBeInTheDocument();
    });

    it('when no proper tag nor date should be null', () => {
      const tags = [
        'settlement',
        'settlemenz:20220525T1200',
        'settlemenx-date:20220425T1200',
      ];
      const { container } = render(<SimpleMarketExpires tags={tags} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
