/**
 * Categorizes and sorts an array of key-value pairs of network params into a nested object structure.
 *
 * The function takes an array of network params where keys are dot-delimited
 * strings representing nested categories (e.g., 'spam.protection.delegation.min.tokens').
 *
 * Why this is necessary:
 * A flat key-value structure wouldn't provide the hierarchical information needed.
 * Organizing network parameters like this allows the rendering of nested headers
 * and their corresponding network params.
 *
 * It also ensures that items with the minimum amount of nesting are ordered first. This
 * allows us to render these items first, before more deeply nested items are rendered with
 * subheaders. This creates a more intuitive UI.
 *
 * For example, given the input:
 * [
 *   { key: 'spam.protection.delegation.min.tokens', value: '10' },
 *   { key: 'spam.protection.voting.min.tokens', value: '5' },
 *   { key: 'reward.staking.delegation.minimumValidatorStake', value: '2' }
 *   { key: 'reward.asset', value: 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55' }
 * ]
 *
 * The output will be:
 * {
 *   spam: {
 *     protection: {
 *       delegation: {
 *         min: {
 *           tokens: '10'
 *         }
 *       },
 *       voting: {
 *         min: {
 *           tokens: '5'
 *         }
 *       }
 *     }
 *   },
 *   reward: {
 *     asset: 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55',
 *     staking: {
 *       delegation: {
 *         minimumValidatorStake: '2'
 *       }
 *     }
 *   }
 * }
 *
 * @param {Array} params - An array of key-value pairs to categorize and sort.
 * @returns {GroupedParams} - A nested object that groups the key-value pairs.
 */

export type GroupedParams = {
  [key: string]: string | GroupedParams;
};

export const structureParams = (
  params: { key: string; value: string }[]
): GroupedParams => {
  const grouped: GroupedParams = {};

  params.forEach(({ key, value }) => {
    const parts = key.split('.');
    let node: GroupedParams = grouped;

    parts.forEach((part, i) => {
      if (typeof node[part] === 'undefined') {
        node[part] = i === parts.length - 1 ? value : {};
      }

      if (typeof node[part] === 'object') {
        node = node[part] as GroupedParams;
      }
    });
  });

  return grouped;
};

export const sortGroupedParams = (
  groupedParams: GroupedParams
): GroupedParams => {
  const sorted: GroupedParams = {};

  // Sort top-level keys first
  Object.entries(groupedParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sorted[key] = value;
    }
  });

  Object.entries(groupedParams).forEach(([key, value]) => {
    if (typeof value === 'object') {
      sorted[key] = sortGroupedParams(value);
    }
  });

  return sorted;
};

export const structureNetworkParams = (
  params: { key: string; value: string }[]
) => {
  const grouped = structureParams(params);
  return sortGroupedParams(grouped);
};
