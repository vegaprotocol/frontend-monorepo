import {
  OrderType,
  StopOrderTriggerDirection,
  type Side,
} from '@vegaprotocol/types';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const StopSummary = ({ oco = false }: { oco?: boolean }) => {
  if (oco) {
    return <SecondarySummary />;
  }

  return <PrimarySummary />;
};

/** Grab fields for the primary order */
const PrimarySummary = () => {
  const form = useForm();
  const type = form.watch('type');
  const side = form.watch('side');
  const triggerType = form.watch('triggerType');
  const triggerDirection = form.watch('triggerDirection');
  const triggerPrice = form.watch('triggerPrice');
  const size = form.watch('size');

  const price = form.watch('price');

  return (
    <Summary
      type={type}
      side={side}
      size={size}
      price={price}
      triggerType={triggerType}
      triggerDirection={triggerDirection}
      triggerPrice={triggerPrice}
    />
  );
};

/** Grab fields for the secondary (oco) order */
const SecondarySummary = () => {
  const form = useForm();
  const type = form.watch('type');
  const side = form.watch('side');
  const size = form.watch('ocoSize');
  const price = form.watch('ocoPrice');
  const triggerType = form.watch('ocoTriggerType');
  const triggerDirection = form.watch('ocoTriggerDirection');
  const triggerPrice = form.watch('ocoTriggerPrice');

  if (!triggerType || !triggerDirection) return null;

  return (
    <Summary
      type={type}
      side={side}
      size={size}
      price={price}
      triggerType={triggerType}
      triggerDirection={triggerDirection}
      triggerPrice={triggerPrice}
    />
  );
};

const Summary = (props: {
  type: OrderType;
  side: Side;
  size?: number;
  price?: number;
  triggerType: 'price' | 'trailingPercentOffset';
  triggerDirection: StopOrderTriggerDirection;
  triggerPrice?: number;
}) => {
  const t = useT();

  let trigger: string | undefined;

  // Set trigger text for trailing percent offset trigger. EG. 'falls 10%
  // from high' or 'rise 25% from low'
  if (props.triggerPrice && props.triggerType === 'trailingPercentOffset') {
    if (
      props.triggerDirection ===
      StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
    ) {
      trigger = t('ticketSummaryFallsBelowOffset', {
        offset: props.triggerPrice,
      });
    } else {
      trigger = t('ticketSummaryRisesAboveOffset', {
        offset: props.triggerPrice,
      });
    }
  }

  // Set trigger text for normal price trigger, EG. 'rises above 10'
  // or 'falls below 25'
  if (props.triggerPrice && props.triggerType === 'price') {
    trigger = `${t(props.triggerDirection)} ${props.triggerPrice}`;
  }

  const text = useSummaryText({
    side: props.side,
    size: props.size,
    price: props.type === OrderType.TYPE_LIMIT ? props.price : 'market',
    trigger,
  });

  return <span data-testid="stop-order-summary">{text}</span>;
};

/** Return translated text with fallbacks for the order */
const useSummaryText = (values: {
  side: Side;
  size?: number;
  price?: number | string;
  trigger?: string;
}) => {
  const t = useT();

  const replacements = {
    side: t(values.side),
    size: values.size || '[size]',
    price: values.price || '[price]',
    trigger: values.trigger || '[trigger]',
  };

  return t('ticketStopSummary', replacements);
};
