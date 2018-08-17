const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

var holidayController = function (holidaySchema) {

    async function getAll(req, res) {
        try {
            await connectToDatabase();

            console.log('JSON.parse(req.query.data) > ', JSON.parse(req.query.data));

            let data = JSON.parse(req.query.data);

            const limit = parseInt(data.limit);
            const page = parseInt(data.page);

            const queryFind = {
                $or: [
                    { "description": { "$regex": data.query, "$options": "i" } },
                    { "classification": { "$regex": data.query, "$options": "i" } },
                ]
            };

            let total = await holidaySchema.find(queryFind).count().exec();

            let items = await holidaySchema.find(queryFind)
                .skip((limit * page) - limit)
                .limit(limit)
                .sort({ code: 1 })
                .exec();

            const result = {
                data: items,
                count: total
            }
            res.status(httpStatus.Ok).json(result);
        } catch (e) {
            res.status(httpStatus.InternalServerError).send('Erro:' + e);
        }
    }

    return {
        getAll: getAll,
    }
}

module.exports = holidayController;
