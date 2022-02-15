import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Blocks } from './home';
import { Block } from './id';

const BlockPage = () => {
  return (
    <Routes>
      <Route index={true} element={<Blocks />} />
      <Route path={`/:block`} element={<Block />} />
    </Routes>
  );
};

export default BlockPage;
