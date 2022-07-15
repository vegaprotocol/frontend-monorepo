Cypress.Commands.add(
  'convert_token_value_to_number',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);

const navigation = {
  section: 'nav',
  home: '[href="/"]',
  vesting: '[href="/vesting"]',
  staking: '[href="/staking"]',
  rewards: '[href="/rewards"]',
  withdraw: '[href="/withdraw"]',
  governance: '[href="/governance"]',
  pageSpinner: 'splash-loader',
};

Cypress.Commands.add('navigate_to', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).click();
  });
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
  cy.get(navigation.pageSpinner, { timeout: 20000 }).should('not.exist');
});
