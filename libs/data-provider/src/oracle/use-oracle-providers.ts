import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { useEnvironment } from '@vegaprotocol/environment';

export type Provider = z.infer<typeof providerSchema>;
export type Oracle = z.infer<typeof oracleSchema>;
export type Proof = z.infer<typeof proofSchema>;
export type Status = z.infer<typeof statusSchema>;

const statusSchema = z.enum([
  'UNKNOWN',
  'GOOD',
  'SUSPICIOUS',
  'MALICIOUS',
  'RETIRED',
  'COMPROMISED',
]);

const baseProofSchema = z.object({
  format: z.enum(['url', 'signed_message']),
  available: z.boolean(),
});

const proofSchema = z.discriminatedUnion('type', [
  baseProofSchema.extend({
    type: z.literal('public_key'),
    public_key: z.string().min(64),
    message: z.string().min(1),
  }),
  baseProofSchema.extend({
    type: z.literal('eth_address'),
    eth_address: z.string().min(42),
    message: z.string().min(1),
  }),
  baseProofSchema.extend({
    type: z.literal('web'),
    url: z.string().url(),
  }),
  baseProofSchema.extend({
    type: z.literal('github'),
    url: z.string().url(),
  }),
  baseProofSchema.extend({
    type: z.literal('twitter'),
    url: z.string().url(),
  }),
]);

const baseOracleSchema = z.object({
  status: statusSchema,
  status_reason: z.string(),
  first_verified: z.string(),
  last_verified: z.string(),
});

const oracleSchema = z.discriminatedUnion('type', [
  baseOracleSchema.extend({
    type: z.literal('public_key'),
    public_key: z.string().min(64),
  }),
  baseOracleSchema.extend({
    type: z.literal('eth_address'),
    eth_address: z.string().min(42),
  }),
]);

const providerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.string(),
  description_markdown: z.string(),
  oracle: oracleSchema,
  proofs: z.array(proofSchema),
  github_link: z.string().url(),
});

export const providersSchema = z.array(providerSchema);

export const useOracleProviders = () => {
  const { ORACLE_PROOFS_URL } = useEnvironment();
  const queryResult = useQuery({
    queryKey: ['oracleProofs'],
    queryFn: async () => {
      if (!ORACLE_PROOFS_URL) return null;
      const res = await fetch(ORACLE_PROOFS_URL);
      const json = await res.json();
      return providersSchema.parse(json);
    },
  });

  return queryResult;
};
