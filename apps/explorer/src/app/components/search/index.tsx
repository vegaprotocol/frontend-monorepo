import { FormGroup, Input, InputError, Button } from '@vegaprotocol/ui-toolkit';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../routes/router-config';

const TX_LENGTH = 64;

interface FormFields {
  search: string;
}

export const Search = () => {
  const { register, handleSubmit } = useForm<FormFields>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<Error | null>(null);
  const onSubmit = React.useCallback(
    (fields: FormFields) => {
      setError(null);

      const search = fields.search;
      if (!search) {
        setError(new Error('Search required'));
      } else if (search.startsWith('0x') && search.length === 2 + TX_LENGTH) {
        if (Number.isNaN(Number(search))) {
          setError(new Error('Transaction is not hexadecimal'));
        } else {
          navigate(`${Routes.TX}/${search}`);
        }
      } else if (search.length === TX_LENGTH) {
        if (Number.isNaN(Number(`0x${search}`))) {
          setError(new Error('Transaction is not hexadecimal'));
        } else {
          navigate(`${Routes.TX}/0x${search}`);
        }
      } else if (!Number.isNaN(Number(search))) {
        navigate(`${Routes.BLOCKS}/${Number(search)}`);
      } else {
        setError(new Error("Something doesn't look right"));
      }
    },
    [navigate]
  );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 flex ml-16 justify-end"
    >
      <FormGroup className="w-2/3 mb-0">
        <Input
          {...register('search')}
          id="search"
          hasError={Boolean(error?.message)}
          type="text"
          autoFocus={true}
          placeholder="Enter block number or transaction hash"
        />
        {error?.message ? (
          <InputError intent="danger" className="flex-1 w-full">
            {error.message}
          </InputError>
        ) : (
          <div className="h-28"></div>
        )}
      </FormGroup>
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
};
