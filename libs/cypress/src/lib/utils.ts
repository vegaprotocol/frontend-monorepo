import { ethers } from 'ethers';
import sha3 from 'js-sha3';
import BigNumber from 'bignumber.js';

/**
 * copy of determineId in libs/wallet/src/utils.ts
 * to avoid pulling in any jsx files which will cypress is not set up to compile
 */
export function determineId(sig: string) {
  return sha3.sha3_256(ethers.utils.arrayify('0x' + sig));
}

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
  orderTabDesc: string[]
) => {
  checkSortChange(orderTabDefault, column);
  cy.get('.ag-header-container').within(() => {
    cy.get(`[col-id="${column}"]`).click();
  });
  checkSortChange(orderTabAsc, column);
  cy.get('.ag-header-container').within(() => {
    cy.get(`[col-id="${column}"]`).click();
  });
  checkSortChange(orderTabDesc, column);
};
const checkSortChange = (tabsArr: string[], column: string) => {
  cy.get('.ag-center-cols-container').within(() => {
    tabsArr.forEach((entry, i) => {
      cy.get(`[row-index="${i}"]`).within(() => {
        cy.get(`[col-id="${column}"]`).should('have.text', tabsArr[i]);
      });
    });
  });
};
