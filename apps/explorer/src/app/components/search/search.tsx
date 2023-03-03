import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Button, Icon, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getSearchType, SearchTypes, toHex } from './detect-search';
import { Routes } from '../../routes/route-names';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

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

export const Search = () => {
  const { register, handleSubmit } = useForm<FormFields>();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const onSubmit = useCallback(
    async (fields: FormFields) => {
      setError(null);

      const query = fields.search;

      if (!query) {
        return setError(new Error(t('Search query required')));
      }

      const result = await getSearchType(query);
      const urlAsHex = toHex(query);
      const unrecognisedError = new Error(
        t('Transaction type is not recognised')
      );

      if (result) {
        switch (result) {
          case SearchTypes.Party:
            return navigate(`${Routes.PARTIES}/${urlAsHex}`);
          case SearchTypes.Transaction:
            return navigate(`${Routes.TX}/${urlAsHex}`);
          case SearchTypes.Block:
            return navigate(`${Routes.BLOCKS}/${Number(query)}`);
          default:
            return setError(unrecognisedError);
        }
      }

      return setError(unrecognisedError);
    },
    [navigate]
  );

  const searchForm = (
    <form className="block min-w-[290px]" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex relative items-stretch gap-2 text-xs">
        <label htmlFor="search" className="sr-only">
          {t('Search by block number or transaction hash')}
        </label>
        <button
          className={classNames(
            'absolute top-[50%] translate-y-[-50%] left-2',
            'text-vega-light-300 dark:text-vega-dark-300'
          )}
        >
          <Icon name="search" />
        </button>
        <Input
          {...register('search')}
          id="search"
          data-testid="search"
          className={classNames(
            'peer',
            'pl-8 py-2 text-xs',
            'border rounded border-vega-light-200 dark:border-vega-dark-200'
          )}
          hasError={Boolean(error?.message)}
          type="text"
          placeholder={t('Enter block number, public key or transaction hash')}
        />
        {error?.message && (
          <div
            className={classNames(
              'hidden peer-focus:block',
              'bg-white dark:bg-black',
              'border rounded-b border-t-0 border-vega-light-200 dark:border-vega-dark-200',
              'absolute top-[100%] flex-1 w-full pb-2 px-2 text-black dark:text-white'
            )}
          >
            <InputError
              data-testid="search-error"
              intent="danger"
              className="text-xs"
            >
              {error.message}
            </InputError>
          </div>
        )}
        <Button
          className="hidden [.search-dropdown_&]:block"
          type="submit"
          size="xs"
          data-testid="search-button"
        >
          {t('Search')}
        </Button>
      </div>
    </form>
  );

  const searchTrigger = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="mt-[-1px] text-vega-light-300 dark:text-vega-dark-300 data-open:text-black dark:data-open:text-white">
          <Icon name="search" size={4} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={classNames(
            'search-dropdown',
            'p-2 min-w-[290px] z-20',
            'text-vega-light-300 dark:text-vega-dark-300',
            'bg-white dark:bg-black',
            'border rounded border-vega-light-200 dark:border-vega-dark-200',
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
      <div className="hidden [.nav-search-full_&]:block">{searchForm}</div>
      <div className="hidden [.nav-search-compact_&]:block">
        {searchTrigger}
      </div>
    </>
  );
};
