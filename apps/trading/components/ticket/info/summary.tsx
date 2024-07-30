import { OrderType, type Side } from '@vegaprotocol/types';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const Summary = () => {
  const form = useForm();
  const type = form.watch('type');
  const side = form.watch('side');
  const size = form.watch('size');
  const price = form.watch('price');

  const text = useSummaryText({
    side: side,
    size: size,
    price: type === OrderType.TYPE_LIMIT ? price : 'market',
  });

  return <span data-testid="order-summary">{text}</span>;
};

/** Return translated text with fallbacks for the order */
const useSummaryText = (values: {
  side: Side;
  size?: number;
  price?: number | string;
}) => {
  const t = useT();

  const replacements = {
    side: t(values.side),
    size: values.size || '[size]',
    price: values.price || '[price]',
  };

  return t('ticketSummary', replacements);
};
