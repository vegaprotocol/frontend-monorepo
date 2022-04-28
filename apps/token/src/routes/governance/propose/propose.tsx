import './propose.scss';

import * as Sentry from '@sentry/react';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Heading } from '../../../components/heading';
import { sigToId } from '../../../lib/sig-to-id';
import type { ProposalSubmissionInput } from '../../../lib/vega-wallet/vega-wallet-service';
import { vegaWalletService } from '../../../lib/vega-wallet/vega-wallet-service';
import type { VegaKeyExtended } from '@vegaprotocol/wallet';

export enum Status {
  Idle,
  Submitted,
  Pending,
  Success,
  Failure,
}

interface FormFields {
  terms: string;
}

export const Propose = ({ pubKey }: { pubKey: VegaKeyExtended }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = React.useState(Status.Idle);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [id, setId] = React.useState('');

  const {
    register,
    handleSubmit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { errors },
    setError,
  } = useForm<FormFields>();

  const submit = React.useCallback(
    async (data: FormFields) => {
      let terms;
      try {
        terms = JSON.parse(data.terms);
      } catch (e) {
        setError('terms', new Error('Terms is not valid JSON'));
        return;
      }
      const command: ProposalSubmissionInput = {
        pubKey: pubKey.pub,
        proposalSubmission: {
          terms,
        },
      };

      setStatus(Status.Submitted);

      try {
        const [err, res] = await vegaWalletService.commandSync(command);
        console.log(err, res);
        if (err || !res) {
          setStatus(Status.Failure);
        } else {
          const id = sigToId(res.signature.value);
          setId(id);
          // Now await subscription
        }

        setStatus(Status.Pending);
      } catch (err) {
        setStatus(Status.Failure);
        Sentry.captureException(err);
      }
    },
    [pubKey.pub, setError]
  );
  return (
    <section className="propose" data-testid="propose">
      {/* TODO translate */}
      <Heading title="Propose" />
      <form onSubmit={handleSubmit(submit)}>
        <textarea {...register('terms')} />
        <button type="submit">Submit</button>
      </form>
    </section>
  );
};
