import { t } from '@vegaprotocol/react-helpers';
import { FormGroup, Input, InputError, Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../routes/route-names';

const TX_LENGTH = 64;

interface FormFields {
  search: string;
}

const isPrependedTransaction = (search: string) =>
  search.startsWith('0x') && search.length === 2 + TX_LENGTH;

const isTransaction = (search: string) =>
  !search.startsWith('0x') && search.length === TX_LENGTH;

const isBlock = (search: string) => !Number.isNaN(Number(search));

export const Search = () => {
  const { register, handleSubmit } = useForm<FormFields>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<Error | null>(null);
  const onSubmit = React.useCallback(
    (fields: FormFields) => {
      setError(null);

      const search = fields.search;
      if (!search) {
        setError(new Error(t('Search required')));
      } else if (isPrependedTransaction(search)) {
        if (Number.isNaN(Number(search))) {
          setError(new Error(t('Transaction is not hexadecimal')));
        } else {
          navigate(`${Routes.TX}/${search}`);
        }
      } else if (isTransaction(search)) {
        if (Number.isNaN(Number(`0x${search}`))) {
          setError(new Error(t('Transaction is not hexadecimal')));
        } else {
          navigate(`${Routes.TX}/0x${search}`);
        }
      } else if (isBlock(search)) {
        navigate(`${Routes.BLOCKS}/${Number(search)}`);
      } else {
        setError(new Error(t("Something doesn't look right")));
      }
    },
    [navigate]
  );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 flex self-center md:ml-16 md:mr-12 md:justify-end"
    >
      <FormGroup className="relative w-full md:w-2/3 mb-0">
        <Input
          {...register('search')}
          id="search"
          data-testid="search"
          hasError={Boolean(error?.message)}
          type="text"
          autoFocus={true}
          placeholder={t('Enter block number or transaction hash')}
        />
        {error?.message && (
          <InputError
            data-testid="search-error"
            intent="danger"
            className="absolute top-[100%] flex-1 w-full"
          >
            {error.message}
          </InputError>
        )}
      </FormGroup>
      <Button type="submit" variant="secondary" data-testid="search-button">
        {t('Search')}
      </Button>
    </form>
  );
};
