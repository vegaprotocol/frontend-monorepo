import { type RefereesQuery } from './__generated__/Referees';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useRefereesQuery } from './__generated__/Referees';
import { useCallback } from 'react';
import pick from 'lodash/pick';

export type Referee = Omit<
  NonNullable<RefereesQuery['referralSetReferees']['edges'][0]>['node'],
  '__typename'
>;

/** The properties that can be overwritten by `propertiesOptions`. */
type RefereeProperty = keyof Pick<
  Referee,
  'totalRefereeGeneratedRewards' | 'totalRefereeNotionalTakerVolume'
>;

/**
 * Options determining which properties should be overwritten based
 * on the different `aggregationEpochs`.
 */
export type PropertiesWithDifferentAggregationEpochs = {
  properties: RefereeProperty[];
  aggregationEpochs: number;
};

/** Find referee by its public key (id) */
export const findReferee = (pubKey: string, referees: Referee[]) =>
  referees.find((r) => r.refereeId === pubKey);

export const useReferees = (
  id: string | undefined | null,
  aggregationEpochs: number,
  propertiesOptions?: PropertiesWithDifferentAggregationEpochs
) => {
  const {
    data: refereesData,
    loading: refereesLoading,
    error: refereesError,
    refetch: refereesRefetch,
  } = useRefereesQuery({
    variables: {
      code: id as string,
      aggregationEpochs,
    },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    context: { isEnlargedTimeout: true },
  });

  const {
    data: extraData,
    loading: extraLoading,
    error: extraError,
    refetch: extraRefetch,
  } = useRefereesQuery({
    variables: {
      code: id as string,
      aggregationEpochs: propertiesOptions?.aggregationEpochs,
    },
    skip:
      // skip if the aggregation epochs are the same
      !id ||
      !propertiesOptions?.aggregationEpochs ||
      propertiesOptions.aggregationEpochs === aggregationEpochs,
    fetchPolicy: 'cache-and-network',
    context: { isEnlargedTimeout: true },
  });

  let referees = [];

  const refereesList = removePaginationWrapper(
    refereesData?.referralSetReferees.edges
  );
  const extraRefereesList = removePaginationWrapper(
    extraData?.referralSetReferees.edges
  );

  referees = refereesList.map((r) =>
    overwriteProperties(r, extraRefereesList, propertiesOptions?.properties)
  );

  const loading = refereesLoading || extraLoading;
  const error = refereesError || extraError;
  const refetch = useCallback(() => {
    refereesRefetch();
    extraRefetch();
  }, [refereesRefetch, extraRefetch]);

  return { data: referees, loading, error, refetch };
};

const overwriteProperties = (
  referee: Referee,
  referees: Referee[],
  properties?: PropertiesWithDifferentAggregationEpochs['properties']
) => {
  let updatedProperties = {};
  const extraRefereeData = findReferee(referee.refereeId, referees);
  if (properties && extraRefereeData) {
    updatedProperties = pick(extraRefereeData, properties);
  }
  return {
    ...referee,
    ...updatedProperties,
  };
};
