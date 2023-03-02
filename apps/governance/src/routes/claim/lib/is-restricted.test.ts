import { isRestricted } from './is-restricted';

afterEach(() => {
  document.cookie = '';
});

it('Returns false on no cookie', () => {
  expect(isRestricted()).toEqual(false);
});

it('Returns false on no restricted cookie', () => {
  document.cookie = 'one=a;two=b';
  expect(isRestricted()).toEqual(false);
});

it('Returns true if a cookie called restricted is set but false', () => {
  document.cookie = 'restricted=false';
  expect(isRestricted()).toEqual(false);
});

it('Returns true if a cookie called restricted is set and true', () => {
  document.cookie = 'restricted=true';
  expect(isRestricted()).toEqual(true);
});

it('Handle weird data', () => {
  document.cookie = ';🍪;;;;;🍪=🍪;;;;;;;;;🍪';
  expect(isRestricted()).toEqual(true);
});
