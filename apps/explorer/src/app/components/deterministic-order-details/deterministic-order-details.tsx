import { t } from '@vegaprotocol/react-helpers';
import { useExplorerDeterministicOrderQuery } from './__generated___/Order';
import { TableCell, TableRow } from '../table';

export interface DeterministicOrderDetailsProps {
  id: string;
}

const DeterministicOrderDetails = ({ id }: DeterministicOrderDetailsProps) => {
  const { data } = useExplorerDeterministicOrderQuery({
    variables: { orderId: id },
  });

  if (!data || !data.orderByID) {
    return null;
  }

  const o = data.orderByID;

  return (
    <>
      <TableRow modifier="bordered">
        <TableCell>{t('Order status')}</TableCell>
        <TableCell>{o.status}</TableCell>
      </TableRow>

      <TableRow modifier="bordered">
        <TableCell>{t('Order version')}</TableCell>
        <TableCell>{o.version}</TableCell>
      </TableRow>
    </>
  );
};

export default DeterministicOrderDetails;
