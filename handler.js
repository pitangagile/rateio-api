'use strict';
// @ts-check

/**
 * End-Point: Ping
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 */
function ping(event, context, callback) {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      ping: new Date().toString()
    }),
  };

  callback(null, response);
};

module.exports = {
  ping
}