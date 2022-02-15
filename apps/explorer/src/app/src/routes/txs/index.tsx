import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Txs } from './home';
import { Tx } from './id';

const TxPage = () => {
  return (
    <Routes>
      <Route index={true} element={<Txs />} />
      <Route path={`/:txHash`} element={<Tx />} />
    </Routes>
  );
};

export default TxPage;
