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
      expect(screen.getByText('25 May 2022 12:00')).toBeInTheDocument();
    });

    it('settlement-date:date', () => {
      const tags = [
        'settlement',
        'settlement:20220525T1200',
        'settlement-date:20220425T1200',
      ];
      render(<SimpleMarketExpires tags={tags} />);
      expect(screen.getByText('25 April 2022 12:00')).toBeInTheDocument();
    });

    it('last one proper tag should matter', () => {
      const tags = [
        'settlement',
        'settlement-date:20220525T1200',
        'settlement-expiry-date:20220325T1200',
      ];
      render(<SimpleMarketExpires tags={tags} />);
      expect(screen.getByText('25 March 2022 12:00')).toBeInTheDocument();
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
