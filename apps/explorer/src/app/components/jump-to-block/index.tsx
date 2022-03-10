import React from 'react';
import { useNavigate } from 'react-router-dom';

export const JumpToBlock = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      blockNumber: { value: number };
    };

    const blockNumber = target.blockNumber.value;

    if (blockNumber) {
      navigate(`/blocks/${blockNumber}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="block-input"
        className="block uppercase text-h5 font-bold"
      >
        Jump to block
      </label>
      <input
        id="block-input"
        type='tel'
        name={'blockNumber'}
        placeholder={'Block number'}
        className="form-input"
      />
      <input className="form-submit" type={'submit'} value={'Go'} />
    </form>
  );
};
