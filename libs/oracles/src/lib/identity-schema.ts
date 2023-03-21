import z from 'zod';

export type Identity = z.infer<typeof identitySchema>;
export type Identities = z.infer<typeof identitiesSchema>;
export type Proof = z.infer<typeof proofSchema>;

const proofSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Url'), url: z.string().url() }),
  z.object({
    type: z.literal('SignedMessage'),
    message: z.string().min(1),
  }),
]);

const baseIdentitySchema = z.object({
  address: z.string().min(42).optional(), // TODO make required if type is ETHAddress
  status: z.enum([
    'UNKNOWN',
    'GOOD',
    'SUSPICIOUS',
    'MALICIOUS',
    'RETIRED',
    'COMPROMISED',
  ]),
  trusted: z.boolean(),
  url: z.string().url(),
  proofs: z.array(proofSchema),
});

export const identitySchema = z.discriminatedUnion('type', [
  baseIdentitySchema.extend({
    type: z.literal('PubKey'),
    key: z.string().min(64),
  }),
  baseIdentitySchema.extend({
    type: z.literal('ETHAddress'),
    address: z.string().min(42),
  }),
]);

export const identitiesSchema = z.array(identitySchema);
