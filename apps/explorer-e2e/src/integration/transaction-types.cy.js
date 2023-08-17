context('Transaction ID page', { tags: '@smoke' }, function () {
  describe('Verify elements on transaction page', function () {
    it.only('Able to view order cancelation', function () {
      const txId =
        'C79AE0040AE7CFE3EACD715E569B043B214D8451405CB40C06EAA1C38F453A85';

      cy.intercept('GET', `/rest/transactions/${txId}`, {
        fixture: '/mocks/cancel_order_transaction.json',
      });
      cy.visit(`/txs/${txId}`);
      cy.validate_transaction_fields(0, 'Type', 'Cancel Order');
      cy.validate_transaction_fields(
        1,
        'Hash',
        'c79ae0040ae7cfe3eacd715e569b043b214d8451405cb40c06eaa1c38f453a85'
      );
      cy.validate_transaction_fields(
        2,
        'Submitter',
        '86ff2c3b45be7c43202d1dc370779d070faaba1029094c46174857f1b445673f',
        '/parties/86ff2c3b45be7c43202d1dc370779d070faaba1029094c46174857f1b445673f'
      );
      cy.validate_transaction_fields(
        3,
        'Block',
        '10277448',
        '/blocks/10277448'
      );
      cy.validate_transaction_fields(5, 'Response code', 'Success');
      cy.contains('Show raw transaction').click();
      cy.get('textarea').should(
        'have.text',
        '{\n "nonce": "18292162483463539777",\n "blockHeight": "10277444",\n "orderCancellation": {\n  "orderId": "",\n  "marketId": ""\n }\n}'
      );
    });

    it('Able to view order amendment', function () {
      const txId =
        '0x28B2C9082E853F83958E91E9CA12343034CE7268DAF05EB987E6DB236C240208';

      cy.intercept('GET', `/rest/transactions/${txId}`, {
        fixture: '/mocks/order_amendment_transaction.json',
      });
      cy.visit(`/txs/${txId}`);
      cy.validate_transaction_fields(0, 'Type', 'Amend Order');
      cy.validate_transaction_fields(
        4,
        'Response code',
        "couldn't insert order in book"
      );
      cy.validate_transaction_fields(
        7,
        'Order',
        'a4a385ef2e8d8d508d129c91680fdd771374a21bd6fc49628a7e79cf53af1fbb'
      );
      cy.validate_transaction_fields(
        8,
        'Market',
        'ETHBTC Quarterly (Jul 2023)',
        '/markets/e6561f69c2a76858866aab2896eeb529b46040614566e0665602d67bc682c31f'
      );
    });
  });
});
