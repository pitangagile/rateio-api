const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const JsonDataHelper = require('../../commons/json-data-helper').Helper;

const data = require('./simple-data.json');

/**
 * Efetua listagem e paginação do grid (com filtragem e ordenação)
 * @param {object} request
 * @param {object} response
 */
function fetch(request, response) {
  try {
    // defaults
    let args = {
      query: request.query.query,
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      orderBy: request.query.orderBy,
      ascending: request.query.ascending == '1',
      byColumn: request.query.byColumn == '1',
    };

    args.orderBy = args.orderBy === 'name' ? 'name.first' : args.orderBy;

    const jsonData = new JsonDataHelper(data);

    jsonData.filter(args.query, ['name.first', 'gender', 'cell'])
      .sort(args.ascending, args.orderBy)
      .limitData(args.page, args.limit);

    const result = {
      data: jsonData.data,
      count: jsonData.count,
    };

    response.status(httpStatus.Ok).json(result);
  } catch (error) {
    response.json({ error: error.message });
  }
}


module.exports = {
  fetch,
};
