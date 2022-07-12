Cypress.Commands.add(
  'convertTokenValueToNumber',
  { prevSubject: true },
  (subject) => {
    return parseFloat(subject.replace(/,/g, ''));
  }
);
