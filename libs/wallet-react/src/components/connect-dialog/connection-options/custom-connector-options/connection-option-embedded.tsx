import { ConnectionOptionDeemphasizedDefault } from '../connection-option-deemphasized-default';
import { type ConnectionOptionProps } from '../types';
import { useConfig } from '../../../../hooks/use-config';
import { useEffect } from 'react';
import { InBrowserConnector } from '@vegaprotocol/wallet';

export const ConnectionOptionEmbeddedWallet = (
  props: ConnectionOptionProps
) => {
  const state = useConfig();
  const onClick = async () => {
    if (!(props.connector instanceof InBrowserConnector)) {
      throw new Error('Connector invalid for this type of connection');
    }
    if (!(await props.connector.hasWallet())) {
      state.store.setState({
        status: 'importing',
      });
    } else {
      props.onClick();
    }
  };
  useEffect(() => {
    const handler = () => {
      props.onClick();
      props.connector.off('client.keys_changed', handler);
    };
    props.connector.on('client.keys_changed', handler);
  }, [props]);
  return <ConnectionOptionDeemphasizedDefault {...props} onClick={onClick} />;
};
