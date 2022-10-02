import React, { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Button, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getSearchType, SearchTypes, toHex } from './detect-search';
import { Routes } from '../../routes/route-names';

interface FormFields {
  search: string;
}

export const Search = () => {
  const { register, handleSubmit } = useForm<FormFields>();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const onSubmit = useCallback(
    async (fields: FormFields) => {
      setError(null);

      const query = fields.search;

      if (!query) {
        setError(new Error(t('Search query required')));
      } else {
        const result = await getSearchType(query);
        const urlAsHex = toHex(query);
        const unrecognisedError = new Error(
          t('Transaction type is not recognised')
        );

        if (result) {
          switch (result) {
            case SearchTypes.Party:
              navigate(`${Routes.PARTIES}/${urlAsHex}`);
              break;
            case SearchTypes.Transaction:
              navigate(`${Routes.TX}/${urlAsHex}`);
              break;
            case SearchTypes.Block:
              navigate(`${Routes.BLOCKS}/${Number(query)}`);
              break;
            default:
              setError(unrecognisedError);
          }
        }

        setError(unrecognisedError);
      }
    },
    [navigate]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full md:max-w-[620px] justify-self-end"
    >
      <label htmlFor="search" className="sr-only">
        {t('Search by block number or transaction hash')}
      </label>
      <div className="flex items-stretch gap-2">
        <Input
          {...register('search')}
          id="search"
          data-testid="search"
          className="text-white"
          hasError={Boolean(error?.message)}
          type="text"
          placeholder={t('Enter block number, party id or transaction hash')}
        />
        {error?.message && (
          <div className="absolute top-[100%] flex-1 w-full">
            <InputError data-testid="search-error" intent="danger">
              {error.message}
            </InputError>
          </div>
        )}
        <Button type="submit" size="sm" data-testid="search-button">
          {t('Search')}
        </Button>
      </div>
    </form>
  );
};
