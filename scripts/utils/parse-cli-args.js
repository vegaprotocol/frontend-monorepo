module.exports = ({ specs, args = [] }) => {
  const defaultConfig = {
    apiUrl: undefined,
    apiVersion: undefined,
  };

  return specs.reduce((acc, spec) => {
    const match = args.find((arg) => arg.startsWith(`--${spec.arg}=`));
    const value = (match || '').replace(`--${spec.arg}=`, '');

    if (spec.required && !value) {
      throw new Error(`Cannot find required CLI argument "--${spec.arg}".`);
    }
    if (typeof spec.validate === 'function') {
      spec.validate(value);
    }
    return {
      ...acc,
      [spec.name]: value || spec.default,
    };
  }, {});
};
