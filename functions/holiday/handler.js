const httpStatus = require('../../commons/http_status_codes');

const holidaysmock = require('../../mocks/holiday_mock');


/*
*Get all informations for index page
*/
function getIndexInformations(event, context, callback) {
    const response = {
        statusCode: httpStatus.Ok,
        body: {},
    }
}

/**
 * Get all holidays
 * @param {object} event
 * @param {object} context
 * @param {function} callback
 */
function getAll(event, context, callback) {
    const response = {
        statusCode: httpStatus.Ok,
        body: holidaysmock,
    };

    callback(null, response);
}

module.exports = {
    getAll,
};
