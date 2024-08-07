import { useParams } from 'react-router-dom';

import { KeyDetailsPage } from './key-details-page';

interface Params extends Record<string, string> {
  id: string;
}

export const KeyDetails = () => {
  const { id } = useParams<Params>();
  if (!id) throw new Error('Id param not provided to key details');
  return <KeyDetailsPage id={id} />;
};
