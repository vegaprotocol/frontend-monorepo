import { ConnectionOptionDeemphasizedDefault } from '../connection-option-deemphasized-default';
import { type ConnectionOptionProps } from '../types';
import { useConfig } from '../../../../hooks/use-config';

export const ConnectionOptionEmbeddedWallet = (
  props: ConnectionOptionProps
) => {
  const state = useConfig();
  const onClick = () => {
    state.store.setState({
      status: 'importing',
    });
  };
  return <ConnectionOptionDeemphasizedDefault {...props} onClick={onClick} />;
};
