import { useCallback } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Button, Input, InputError, Intent } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../routes/route-names';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { remove0x } from '@vegaprotocol/utils';
import { determineType, isBlock, isHash, SearchTypes } from './detect-search';

interface FormFields {
  search: string;
}

const MagnifyingGlass = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line
      x1="12.8202"
      y1="13.1798"
      x2="17.0629"
      y2="17.4224"
      stroke="currentColor"
    />
    <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
  </svg>
);

const Clear = () => (
  <svg
    className="w-3 h-3"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3748 1.37478L1.37478 11.3748L0.625244 10.6252L10.6252 0.625244L11.3748 1.37478Z"
      fill="currentColor"
    />
    <path
      d="M1.37478 0.625244L11.3748 10.6252L10.6252 11.3748L0.625244 1.37478L1.37478 0.625244Z"
      fill="currentColor"
    />
  </svg>
);

export const Search = () => {
  const searchForm = <SearchForm />;

  const searchTrigger = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="text-gs-300 data-open:text-black dark:data-open:text-white flex items-center">
          <MagnifyingGlass />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={classNames(
            'search-dropdown',
            'p-2 min-w-[290px] z-20',
            'text-gs-300',
            'bg-gs-900',
            'border rounded border-gs-200 ',
            'shadow-[8px_8px_16px_0_rgba(0,0,0,0.4)]'
          )}
          align="end"
          sideOffset={10}
        >
          {searchForm}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  return (
    <>
      <div className="hidden [.nav-search-full_&]:block min-w-[290px]">
        {searchForm}
      </div>
      <div className="hidden [.nav-search-compact_&]:block">
        {searchTrigger}
      </div>
    </>
  );
};

export const SearchForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState,
    watch,
  } = useForm<FormFields>();
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (fields: FormFields) => {
      clearErrors();
      const type = await determineType(fields.search);
      if (type) {
        switch (type) {
          case SearchTypes.Party:
            return navigate(`${Routes.PARTIES}/${remove0x(fields.search)}`);
          case SearchTypes.Transaction:
            return navigate(`${Routes.TX}/${remove0x(fields.search)}`);
          case SearchTypes.Block:
            return navigate(`${Routes.BLOCKS}/${Number(fields.search)}`);
        }
      }

      setError('search', new Error(t('The search term is not a valid query')));
    },
    [clearErrors, navigate, setError]
  );

  const searchQuery = watch('search', '');

  return (
    <form className="block min-w-[200px]" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex relative items-stretch gap-2 text-xs">
        <div className="relative w-full">
          <label htmlFor="search" className="sr-only">
            {t('Search by block number or transaction hash')}
          </label>
          <button
            className={classNames(
              'absolute top-[50%] translate-y-[-50%] left-2',
              'text-gs-300'
            )}
          >
            <MagnifyingGlass />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setValue('search', '');
              clearErrors();
            }}
            className={classNames(
              { hidden: searchQuery.length === 0 },
              'absolute top-[50%] translate-y-[-50%] right-2',
              'text-gs-300'
            )}
          >
            <Clear />
          </button>
          <Input
            {...register('search', {
              required: t('Search query is required'),
              validate: (value) =>
                isHash(value) ||
                isBlock(value) ||
                t('Search query has to be a number or a 64 character hash'),
              onBlur: () => clearErrors('search'),
            })}
            id="search"
            data-testid="search"
            className={classNames(
              'pl-8 py-2 text-xs',
              { 'pr-8': searchQuery.length > 1 },
              'border rounded border-gs-200 ',
              {
                'border-vega-pink dark:border-vega-pink': Boolean(
                  formState.errors.search
                ),
              }
            )}
            hasError={Boolean(formState.errors.search)}
            type="text"
            placeholder={t(
              'Enter block number, public key or transaction hash'
            )}
          />
        </div>
        {formState.errors.search && (
          <div
            className={classNames(
              '[nav_&]:border [nav_&]:rounded [nav_&]:border-gs-300 [nav_&]:dark:border-gs-300',
              '[.search-dropdown_&]:border [.search-dropdown_&]:rounded [.search-dropdown_&]:border-gs-300 [.search-dropdown_&]:dark:border-gs-300',
              'bg-gs-900',
              'absolute top-[100%] flex-1 w-full pb-2 px-2 text-black dark:text-white'
            )}
          >
            <InputError
              data-testid="search-error"
              intent="danger"
              className="text-xs"
            >
              {formState.errors.search.message}
            </InputError>
          </div>
        )}
        <Button
          intent={Intent.Primary}
          type="submit"
          size="xs"
          data-testid="search-button"
          className="[nav_&]:hidden"
        >
          {t('Search')}
        </Button>
      </div>
    </form>
  );
};
