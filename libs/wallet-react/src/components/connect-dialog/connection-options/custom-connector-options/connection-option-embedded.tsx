import { ConnectionOptionDeemphasizedDefault } from '../connection-option-deemphasized-default';
import { type ConnectionOptionProps } from '../types';
import { useConfig } from '../../../../hooks/use-config';
import { useEffect } from 'react';

export const ConnectionOptionEmbeddedWallet = (
  props: ConnectionOptionProps
) => {
  const state = useConfig();
  const onClick = () => {
    state.store.setState({
      status: 'importing',
    });
  };
  useEffect(() => {
    const handler = () => {
      props.onClick();
      props.connector.off('client.keys_changed', handler);
    };
    props.connector.on('client.keys_changed', handler);
  }, []);
  return <ConnectionOptionDeemphasizedDefault {...props} onClick={onClick} />;
};
