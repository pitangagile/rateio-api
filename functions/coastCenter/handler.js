// @ts-check

const httpStatus = require('../../commons/http_status_codes');

const coastcentersmock = require('../../mocks/coastcenter_mock');

/**
 * Get all coast centers
 * @param {object} event
 * @param {object} context
 * @param {function} callback
 */
function getAll(event, context, callback) {
    const response = {
        statusCode: httpStatus.Ok,
        body: coastcentersmock,
    };

    callback(null, response);
}

module.exports = {
    getAll,
};
