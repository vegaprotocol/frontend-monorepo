import { createSuccessorMarketProposal } from '../support/governance.functions';

context('Market page', { tags: '@regression' }, function () {
  describe('Verify elements on page', function () {
    const marketHeaders = 'markets-heading';

    before('Create market', function () {
      cy.visit('/');
      cy.createMarket();
    });

    beforeEach('Get market id', function () {
      cy.navigate_to('markets');
      cy.get('[col-id="id"]').last().invoke('text').as('createdMarketId');
    });

    it('Market displayed on market page', function () {
      cy.navigate_to('markets');
      cy.getByTestId(marketHeaders).should('be.visible');
      cy.get(`[row-id="${this.createdMarketId}"]`)
        .should('be.visible')
        .within(() => {
          cy.get_element_by_col_id('code').should('have.text', 'TEST.24h');
          cy.get_element_by_col_id('name').should('have.text', 'Test market 1');
          cy.get_element_by_col_id('state').should('have.text', 'Pending');
          cy.get_element_by_col_id('asset').should('have.text', 'fUSDC');
          cy.get_element_by_col_id('id').should(
            'have.text',
            this.createdMarketId
          );
          cy.get_element_by_col_id('actions')
            .find('a')
            .should('have.attr', 'href', `/markets/${this.createdMarketId}`);
        });
    });

    it('Able to go to market details page', function () {
      cy.navigate_to('markets');
      cy.get_element_by_col_id('actions').eq(1).click();
      cy.getByTestId(marketHeaders).should('have.text', 'Test market 1');
      cy.validate_element_from_table('Name', 'Test market 1');
      cy.validate_element_from_table('Market ID', this.createdMarketId);
      cy.validate_element_from_table('Trading Mode', 'Opening auction');
      cy.validate_element_from_table('Market Decimal Places', '5');
      cy.validate_element_from_table('Position Decimal Places', '5');
      cy.validate_element_from_table('Settlement Asset Decimal Places', '5');
      // Instrument
      cy.validate_element_from_table('Market Name', 'Test market 1');
      cy.validate_element_from_table('Code', 'TEST.24h');
      cy.validate_element_from_table('Product Type', 'Future');
      cy.validate_element_from_table('Quote Name', 'fUSDC');
      // Settlement Asset
      cy.validate_element_from_table('Quote Name', 'fUSDC');
      cy.validate_element_from_table('Symbol', 'fUSDC');
      cy.validate_element_from_table('Decimals', '5');
      cy.validate_element_from_table('Quantum', '0.00');
      cy.validate_element_from_table('Status', 'Enabled');
      cy.validate_element_from_table('Max faucet amount', '10,000,000.00');
      cy.validate_element_from_table(
        'Infrastructure fee account balance',
        '0.00'
      );
      cy.validate_element_from_table(
        'Global reward pool account balance',
        '0.00'
      );
      // Metadata
      cy.validate_element_from_table('Sector', 'tech');
      cy.validate_element_from_table('Source', 'docs.vega.xyz');
      // Risk model
      cy.validate_element_from_table('Tau', '0.0001140771161');
      cy.validate_element_from_table('Risk Aversion Parameter', '0.01');
      // Risk parameters
      // cy.validate_element_from_table('R', '0.016')
      cy.validate_element_from_table('Sigma', '0.5');
      // Risk factors
      cy.validate_element_from_table('Short', '0.0143218738374871');
      cy.validate_element_from_table('Long', '0.0141450471498822');
      // Price monitoring settings 1
      cy.validate_element_from_table('Horizon Secs', '43,200');
      cy.validate_element_from_table('Probability', '1');
      cy.validate_element_from_table('Auction Extension Secs', '600');
      // Liquidity Monitoring
      cy.validate_element_from_table('Triggering Ratio', '0.7');
      cy.validate_element_from_table('Time Window', '3,600');
      cy.validate_element_from_table('Scaling Factor', '10');
      // Liquidity
      cy.validate_element_from_table('Target Stake', '0.00 fUSDC');
      cy.validate_element_from_table('Supplied Stake', '0.00 fUSDC');
      // Liquidity price range
      cy.validate_element_from_table(
        'Liquidity Price Range',
        '1,000.00% of mid price'
      );
      cy.validate_element_from_table('Lowest Price', '0.00 fUSDC');
      cy.validate_element_from_table('Highest Price', '0.00 fUSDC');
      cy.getByTestId('oracle-spec-links')
        .should('have.attr', 'href')
        .and(
          'contain',
          '/oracles/bf242aa5c9f64fcbb77808aa8582e73711519f4b35264eb797a80f1803590a24'
        );

      // Able to view Json
      cy.contains('View JSON').click();
      cy.get('.language-json').should('exist');
      cy.getByTestId('icon-cross').click();
    });

    // Skipping due to resize observer loop limit error
    it.skip('Markets page displayed on mobile', function () {
      cy.common_switch_to_mobile_and_click_toggle();
      cy.navigate_to('markets', true);
      cy.getByTestId(marketHeaders).should('be.visible');
      cy.get(`[row-id="${this.createdMarketId}"]`)
        .should('be.visible')
        .within(() => {
          cy.get_element_by_col_id('code').should('have.text', 'TEST.24h');
          cy.get_element_by_col_id('name').should('have.text', 'Test market 1');
          cy.get_element_by_col_id('state').should('have.text', 'Pending');
          cy.get_element_by_col_id('asset').should('have.text', 'fUSDC');
          cy.get_element_by_col_id('id').should(
            'have.text',
            this.createdMarketId
          );
          cy.get_element_by_col_id('actions')
            .find('a')
            .should('have.attr', 'href', `/markets/${this.createdMarketId}`);
        });
    });

    it('Able to go to market details page for successor market', function () {
      const successionLineItem = 'succession-line-item';
      const successionLineMarketId = 'succession-line-item-market-id';

      createSuccessorMarketProposal(this.createdMarketId);
      cy.navigate_to('markets');
      cy.reload();
      cy.contains('Token test market', { timeout: 8000 }).should('be.visible');
      cy.get('[row-index="0"]')
        .invoke('attr', 'row-id')
        .as('successorMarketId');
      cy.contains('Token test market').click();
      cy.getByTestId(marketHeaders).should('have.text', 'Token test market');
      cy.validate_element_from_table('Triggering Ratio', '0.7');
      cy.validate_element_from_table('Time Window', '3,600');
      cy.validate_element_from_table('Scaling Factor', '10');

      cy.getByTestId(successionLineItem)
        .first()
        .within(() => {
          cy.contains('Test market 1');
          cy.getByTestId(successionLineMarketId).should(
            'have.text',
            this.createdMarketId
          );
        });
      cy.getByTestId(successionLineItem)
        .eq(1)
        .within(() => {
          cy.contains('Token test market');
          cy.getByTestId(successionLineMarketId).should(
            'have.text',
            this.successorMarketId
          );
        });
    });
  });
});
