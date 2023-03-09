import { BigNumber } from 'bignumber.js';

Cypress.Commands.add(
  'common_validate_blocks_data_displayed',
  function (headerTestId) {
    cy.get(headerTestId).then(($assetHeaders) => {
      const headersLength = Number($assetHeaders.length);

      cy.wrap($assetHeaders).each(($header) => {
        expect($header).to.not.be.empty;
      });

      cy.get('.language-json')
        .each(($asset) => {
          expect($asset).to.not.be.empty;
        })
        .then(($list) => {
          expect($list).to.have.length(headersLength);
        });
    });
  }
);

Cypress.Commands.add('switchToMobile', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('common_switch_to_mobile_and_click_toggle', function () {
  cy.viewport('iphone-x');
  cy.visit('/');
  cy.get('[data-testid="open-menu"]').click();
});

Cypress.Commands.add('monitor_clipboard', () => {
  cy.window().then((win) => {
    return cy.stub(win, 'prompt').returns(win.prompt);
  });
});

Cypress.Commands.add(
  'get_copied_text_from_clipboard',
  { prevSubject: true },
  (clipboard) => {
    // Must first setup with cy.monitor_clipboard().as('clipboard')
    // This function then chained off a cy.get('@clipboard')
    return clipboard.args[0][1];
  }
);

Cypress.Commands.add(
  'convert_string_json_to_js_object',
  { prevSubject: true },
  (jsonBlobString) => {
    // Note: this is a chaining function
    return JSON.parse(jsonBlobString);
  }
);

Cypress.Commands.add(
  'add_commas_to_number_if_large_enough',
  { prevSubject: true },
  (number) => {
    // This will turn 10000000.0000 into 10,000,000.000
    // Note: this is a chaining function
    const beforeDecimal = number.split('.')[0];
    const afterDecimal = number.split('.')[1];
    const beforeDecimalWithCommas = beforeDecimal
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedValue = beforeDecimalWithCommas + '.' + afterDecimal;
    return formattedValue;
  }
);

Cypress.Commands.add('convert_number_to_max_eighteen_decimal', (number) => {
  // this will take a number like this   : 700000000000000000001
  // and convert it to a number like this: 700.000000000000000001
  const value = BigNumber(number / 1000000000000000000).toString();
  return parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 18,
  });
});

Cypress.Commands.add('convert_number_to_max_four_decimal', (number) => {
  return parseFloat(number).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
});
