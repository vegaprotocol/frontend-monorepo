import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { Input } from '@vegaprotocol/ui-toolkit';
import { useRef } from 'react';
import { Order } from '../../hooks/use-order-state';

interface ExpirySelectorProps {
  order: Order;
  onSelect: (expiration: Date | null) => void;
}

export const ExpirySelector = ({ order, onSelect }: ExpirySelectorProps) => {
  const inputRef = useRef(null);
  return (
    <div className="mb-12">
      <DatePicker
        selected={order.expiration}
        onChange={(date) => onSelect(date)}
        showTimeInput={true}
        minDate={new Date()}
        dateFormat={'yyyy MM dd HH:mm'}
        customInput={<Input ref={inputRef} className="w-full" />}
      />
    </div>
  );
};
