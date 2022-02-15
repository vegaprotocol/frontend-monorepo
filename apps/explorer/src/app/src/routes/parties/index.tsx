import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Parties } from './home';
import { Party } from './id';

const PartiesPage = () => {
  return (
    <Routes>
      <Route index={true} element={<Parties />} />
      <Route path={`/:party`} element={<Party />} />
    </Routes>
  );
};

export default PartiesPage;
