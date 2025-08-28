"use strict";
exports.__esModule = true;
exports.formatValidationErrors = void 0;
function formatValidationErrors(errors) {
    return errors.map(function (e) {
        var err = e;
        return {
            field: err.param || err.path || 'field',
            message: err.msg
        };
    });
}
exports.formatValidationErrors = formatValidationErrors;
