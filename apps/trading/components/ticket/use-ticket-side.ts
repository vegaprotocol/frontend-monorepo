import { useState } from 'react';
import { Side } from '@vegaprotocol/types';

export const useTicketSide = () => {
  return useState<Side>(Side.SIDE_BUY);
};
