function formatValidationErrors(errors) {
  return errors.map(e => {
    return {
      field: e.param || e.path || 'field',
      message: e.msg
    };
  });
}

module.exports = {
  formatValidationErrors
};