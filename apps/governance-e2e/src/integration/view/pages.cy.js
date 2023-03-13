context(
  'Landing pages - verifies required elements',
  { tags: '@smoke' },
  () => {
    const navbar = 'nav .navbar';
    const mobileNav = '[data-testid="menu-drawer"]';

    const topLevelLinks = [
      {
        name: 'Proposals',
        selector: '[href="/proposals"]',
        tests: () => {
          it('should be able to see a working link for - find out more about Vega governance', function () {
            const governanceDocsUrl = 'https://vega.xyz/governance';
            const proposalDocumentationLink =
              '[data-testid="proposal-documentation-link"]';
            // 3001-VOTE-001
            cy.get(proposalDocumentationLink)
              .should('be.visible')
              .and('have.text', 'Find out more about Vega governance')
              .and('have.attr', 'href')
              .and('equal', governanceDocsUrl);

            // 3002-PROP-001
            cy.request(governanceDocsUrl)
              .its('body')
              .then((body) => {
                if (!body.includes('Govern the network')) {
                  assert.include(
                    body,
                    'Govern the network',
                    `Checking that governance link destination includes 'Govern the network' text`
                  );
                }
              });
          });

          it('should be able to see button for - new proposal', function () {
            // 3001-VOTE-002
            const newProposalLink = '[data-testid="new-proposal-link"]';
            cy.get(newProposalLink)
              .should('be.visible')
              .and('have.text', 'New proposal')
              .and('have.attr', 'href')
              .and('equal', '/proposals/propose');
          });
        },
      },
      {
        name: 'Validators',
        selector: '[href="/validators"]',
        tests: () => {
          it('Should have Staking Guide link visible', function () {
            // 2001-STKE-003
            cy.get('[data-testid="staking-guide-link"]')
              .should('be.visible')
              .and('have.text', 'Read more about staking on Vega')
              .and(
                'have.attr',
                'href',
                'https://docs.vega.xyz/mainnet/concepts/vega-chain/#staking-on-vega'
              );
          });
        },
      },
      {
        name: 'Rewards',
        selector: '[href="/rewards"]',
        header: 'Rewards and fees',
        tests: () => {
          it('should have epoch warning', () => {
            cy.get('[data-testid="callout"]')
              .should('be.visible')
              .and(
                'have.text',
                'Rewards are credited less than a minute after the epoch ends.This delay is set by a network parameter'
              );
          });
          it('should have toggle for seeing total vs individual rewards', () => {
            cy.get('[data-testid="epoch-reward-view-toggle-total"]').should(
              'be.visible'
            );
          });
        },
      },
    ];

    const secondLevelLinks = [
      {
        trigger: true,
        name: 'Token',
        selector: '[data-testid="state-trigger"]',
      },
      {
        name: 'Token',
        selector: '[href="/token"]',
        header: 'The $VEGA token',
      },
      {
        name: 'Supply & Vesting',
        selector: '[href="/token/tranches"]',
        header: 'Vesting tranches',
      },
      {
        name: 'Withdraw',
        selector: '[href="/token/withdraw"]',
        header: 'Withdrawals',
        tests: () => {
          it('should have connect Vega wallet button', function () {
            cy.get('[data-testid="connect-to-vega-wallet-btn"]')
              .should('be.visible')
              .and('have.text', 'Connect Vega wallet');
          });
        },
      },
      {
        name: 'Redeem',
        selector: '[href="/token/redeem"]',
        header: 'Vesting',
        tests: () => {
          // 1005-VEST-018
          it('should have connect Eth wallet button', function () {
            cy.get('[data-testid="connect-to-eth-btn"]')
              .should('be.visible')
              .and('have.text', 'Connect Ethereum wallet');
          });
        },
      },
      {
        name: 'Associate',
        selector: '[href="/token/associate"]',
        header: 'Associate $VEGA tokens with Vega Key',
      },
      {
        name: 'Disassociate',
        selector: '[href="/token/disassociate"]',
        header: 'Disassociate $VEGA tokens from a Vega key',
      },
    ];

    const expand = () => {
      const trigger = secondLevelLinks.find((l) => l.trigger).selector;
      cy.get(trigger).then((el) => {
        if (el.attr('aria-expanded') === 'false') {
          el.trigger('click');
        }
      });
    };

    const collapse = () => {
      const trigger = secondLevelLinks.find((l) => l.trigger).selector;
      cy.get(trigger).then((el) => {
        if (el.attr('aria-expanded') === 'true') {
          el.trigger('click');
        }
      });
    };

    const ensureHeader = (text) => {
      cy.get('main header h1').should('have.text', text);
    };

    before(() => {
      // goes to HOME
      cy.visit('/');
      // and waits for it to load
      cy.get(navbar, { timeout: 10000 }).should('be.visible');
    });

    describe('Navigation (desktop)', () => {
      for (const { name, selector } of topLevelLinks) {
        it(`should have ${name} nav link`, () => {
          cy.get(navbar).within(() => {
            cy.get(selector).should('be.visible');
            cy.get(selector).should('have.text', name);
          });
        });
      }

      for (const { name, selector, trigger } of secondLevelLinks) {
        it(`should have ${name} ${
          trigger ? 'as trigger button' : ''
        } second level nav link`, () => {
          cy.get(navbar).within(() => {
            cy.get(selector).should('be.visible');
            cy.get(selector).should('have.text', name);
            if (trigger) cy.get(selector).click();
          });
        });
      }

      after(() => {
        collapse();
      });
    });

    describe('Navigation (mobile)', () => {
      beforeEach(() => {
        // iphone xr
        cy.viewport(414, 896);
      });

      it('should have burger button', () => {
        cy.get('[data-testid="button-menu-drawer"]').should('be.visible');
        cy.get('[data-testid="button-menu-drawer"]').click();
        cy.get(mobileNav).should('be.visible');
      });

      for (const { name, selector } of topLevelLinks) {
        it(`should have ${name} nav link`, () => {
          cy.get(mobileNav).within(() => {
            cy.get(selector).should('be.visible');
            cy.get(selector).should('have.text', name);
          });
        });
      }

      for (const { name, selector, trigger } of secondLevelLinks) {
        it(`should have ${name} ${
          trigger ? 'as trigger button' : ''
        } second level nav link`, () => {
          cy.get(mobileNav).within(() => {
            cy.get(selector).should('be.visible');
            cy.get(selector).should('have.text', name);
          });
        });
      }

      after(() => {
        cy.get('[data-testid="button-menu-drawer"]').click();
        cy.viewport(
          Cypress.config('viewportWidth'),
          Cypress.config('viewportHeight')
        );
      });
    });

    describe('Elements', () => {
      for (const { name, selector, header, tests } of topLevelLinks) {
        describe(`${name} page`, () => {
          it(`navigates to ${name}`, () => {
            cy.get(navbar).within(() => {
              cy.log(`goes to ${name}`);
              cy.get(selector).click();
              cy.log(`ensures ${name} is highlighted`);
              cy.get(selector).should('have.attr', 'aria-current');
            });
          });
          it('displays header', () => {
            ensureHeader(header || name);
          });

          if (tests) tests.apply(this);
        });
      }

      for (const { name, selector, header, tests } of secondLevelLinks.filter(
        (l) => !l.trigger
      )) {
        describe(`${name} page`, () => {
          it(`navigates to ${name}`, () => {
            cy.get(navbar).within(() => {
              expand();
              cy.log(`goes to ${name}`);
              cy.get(selector).click();
              expand();
              cy.log(`ensures ${name} is highlighted`);
              cy.get(selector).should('have.attr', 'aria-current');
            });
          });
          it('displays header', () => {
            ensureHeader(header || name);
          });

          if (tests) tests.apply(this);
        });
      }

      after(() => {
        collapse();
      });
    });
  }
);
