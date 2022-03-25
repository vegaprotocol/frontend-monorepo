import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../routes/router-config';
import { Input, Button } from '@vegaprotocol/ui-toolkit';

export const JumpToBlock = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      blockNumber: { value: number };
    };

    const blockNumber = target.blockNumber.value;

    if (blockNumber) {
      navigate(`/${Routes.BLOCKS}/${blockNumber}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="block-input"
        className="block uppercase text-h5 font-bold mb-4"
      >
        Jump to block
      </label>
      <div className="flex">
        <Input
          id="block-input"
          type="number"
          name="blockNumber"
          placeholder="Block number"
          className="max-w-[200px]"
        />
        <Button variant="secondary" type="submit">
          Go
        </Button>
      </div>
    </form>
  );
};
