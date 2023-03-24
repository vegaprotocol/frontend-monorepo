import z from 'zod';

export type Provider = z.infer<typeof providerSchema>;
export type Identity = z.infer<typeof identitySchema>;
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
  first_verified: z.string(),
  last_verified: z.string(),
});

const proofSchema = z.discriminatedUnion('type', [
  baseProofSchema.extend({
    type: z.literal('SignedMessage'),
    message: z.string(),
  }),
  baseProofSchema.extend({
    type: z.literal('Url'),
    url: z.string().url(),
  }),
]);

const baseIdentitySchema = z.object({
  status: statusSchema,
  status_reason: z.string(),
  proofs: z.array(proofSchema),
});

const identitySchema = z.discriminatedUnion('type', [
  baseIdentitySchema.extend({
    type: z.literal('PubKey'),
    key: z.string().min(64), // TODO check chars
  }),
  baseIdentitySchema.extend({
    type: z.literal('ETHAddress'),
    address: z.string().min(42), // TODO check chars
  }),
]);

const providerSchema = z.object({
  name: z.string().min(1),
  status: statusSchema,
  status_reason: z.string(),
  trusted: z.boolean(),
  url: z.string().url(),
  description_markdown: z.string(),
  isTestNetworkOnly: z.boolean().optional(),
  identities: z.array(identitySchema),
  github_link: z.string().url(),
});

export const providersSchema = z.array(providerSchema);
