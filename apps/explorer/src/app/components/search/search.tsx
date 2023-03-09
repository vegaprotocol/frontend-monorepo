import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full md:max-w-[620px] justify-self-end"
    >
      <label htmlFor="search" className="sr-only">
        {t('Search by block number or transaction hash')}
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex grow relative">
          <Input
            {...register('search')}
            id="search"
            data-testid="search"
            className="text-white"
            hasError={Boolean(error?.message)}
            type="text"
            placeholder={t(
              'Enter block number, public key or transaction hash'
            )}
          />
          {error?.message && (
            <div className="bg-white border border-t-0 border-accent absolute top-[100%] flex-1 w-full pb-2 px-2 rounded-b text-black">
              <InputError data-testid="search-error" intent="danger">
                {error.message}
              </InputError>
            </div>
          )}
        </div>
        <Button type="submit" size="sm" data-testid="search-button">
          {t('Search')}
        </Button>
      </div>
    </form>
  );
};
