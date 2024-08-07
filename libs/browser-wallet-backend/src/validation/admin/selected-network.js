/* eslint-disable */
/// Autogenerated by 'scripts/compile-ajv-schema.js' target 'schemas'
const validate = validate14;
function validate14(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null;
  let errors = 0;
  if (data !== null) {
    const err0 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'null' },
      message: 'must be null',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  validate14.errors = vErrors;
  return errors === 0;
}

export { validate14 as default, validate };
