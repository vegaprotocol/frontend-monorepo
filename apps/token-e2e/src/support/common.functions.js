Cypress.Commands.add(
  'convertTokenValueToNumber',
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
};

Cypress.Commands.add('navigateTo', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).click();
  });
});

Cypress.Commands.add('verifyTabHighlighted', (page) => {
  return cy.get(navigation.section).within(() => {
    cy.get(navigation[page]).should('have.attr', 'aria-current');
  });
});

Cypress.Commands.add('pageHeader', () => {
  return cy.get('header h1');
});
