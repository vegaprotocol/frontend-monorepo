import BigNumber from 'bignumber.js';

/**
 * copy of removeDecimal from libs/react-helpers/src/lib/format/number.tsx
 * to avoid pulling in any jsx files which will cypress is not set up to compile
 */
export function removeDecimal(value: string, decimals: number): string {
  if (!decimals) return value;
  return new BigNumber(value || 0).times(Math.pow(10, decimals)).toFixed(0);
}

export async function promiseWithTimeout(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  promise: Promise<any>,
  time: number,
  name: string
) {
  const rejectAfterTimeout = (time = 0) => {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error(`${name}: timed out after ${time}ms`)),
        time
      );
    });
  };

  return await Promise.race([promise, rejectAfterTimeout(time)]);
}

export const checkSorting = (
  column: string,
  orderTabDefault: string[],
  orderTabAsc: string[],
  orderTabDesc: string[],
  additionalColumnSelector = ''
) => {
  checkSortChange(orderTabDefault, column, additionalColumnSelector);
  cy.get('.ag-header-container')
    .last()
    .within(() => {
      cy.get(`[col-id="${column}"]`).last().click();
    });
  checkSortChange(orderTabAsc, column, additionalColumnSelector);
  cy.get('.ag-header-container')
    .last()
    .within(() => {
      cy.get(`[col-id="${column}"]`).click();
    });
  checkSortChange(orderTabDesc, column, additionalColumnSelector);
  cy.get('.ag-header-container')
    .last()
    .within(() => {
      cy.get(`[col-id="${column}"]`).click();
    });
};

const checkSortChange = (
  tabsArr: string[],
  column: string,
  additionalColumnSelector = ''
) => {
  cy.get('.ag-center-cols-container')
    .last()
    .within(() => {
      tabsArr.forEach((entry, i) => {
        cy.get(`[row-index="${i}"]`).within(() => {
          cy.get(`[col-id="${column}"]${additionalColumnSelector}`).should(
            'have.text',
            tabsArr[i]
          );
        });
      });
    });
};

type Edges = { node: unknown }[];
export function edgesToList(edges: Edges) {
  // @ts-ignore - ignoring Cypress type error which gets resolved when Cypress uses the command
  return edges.map((edge) => {
    return edge.node;
  });
}
