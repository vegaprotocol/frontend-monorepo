import Ajv from 'ajv';
import type { Configuration } from '../types';

const ajv = new Ajv();

const schema = {
  type: 'object',
  properties: {
    hosts: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

const validate = ajv.compile(schema);

export const validateConfiguration = (config: Configuration) =>
  validate(config);
