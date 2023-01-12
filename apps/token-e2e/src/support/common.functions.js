Cypress.Commands.add(
  'convert_token_value_to_number',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);

const navigation = {
  section: 'nav',
  vesting: '[href="/token/redeem"]',
  validators: '[href="/validators"]',
  rewards: '[href="/rewards"]',
  withdraw: '[href="/token/withdraw"]',
  proposals: '[href="/proposals"]',
  pageSpinner: '[data-testid="splash-loader"]',
  supply: '[href="/token/tranches"]',
  token: '[href="/token"]',
};

const topLevelRoutes = ['proposals', 'validators', 'rewards']

Cypress.Commands.add('navigate_to', (page) => {
  const tokenDropDown = 'state-trigger';

  if (!topLevelRoutes.includes(page)) {
    cy.getByTestId(tokenDropDown, { timeout: 10000 }).click();
    cy.getByTestId('token-dropdown').within(() => {
      cy.get(navigation[page]).click();
    });
  } else {
    return cy.get(navigation.section, { timeout: 10000 }).within(() => {
      cy.get(navigation[page]).click();
    });
  }
});

Cypress.Commands.add('verify_tab_highlighted', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).should('have.attr', 'aria-current');
  });
});

Cypress.Commands.add('verify_page_header', (text) => {
  return cy.get('header h1').should('be.visible').and('have.text', text);
});

Cypress.Commands.add('wait_for_spinner', () => {
  cy.get(navigation.pageSpinner).should('exist');
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
});
