const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

const HolidaySchema = require('../../models/holiday');

/**
 * Busca todas as informações necessárias para carregar a página inicial de feriados
 * @param {object} request
 * @param {object} response
 */
function getIndexData(request, response) {
    const years = ['2018', '2017'];

    response.send({ years: years });
}

/**
 * Busca todos os feriados do banco de dados
 * @param {object} req
 * @param {object} res
 */
function getAll(req, res) {
    connectToDatabase()
        .then(() => {
            co(function* () {
                let holidays = yield HolidaySchema.find();
                res.send("Resultado: " + holidays);
            }).catch((error) => {
                res.send('Erro:' + error);
            });
        });
}

/**
 * Creates a new Holiday
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newHoliday = new HolidaySchema({
                date: new Date(),
                description: 'Natal',
                classification: 'Nacional',
                percentageWorked: 0,
            });

            newHoliday.save();
            res.status(httpStatus.Ok).end();
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

module.exports = {
    getIndexData,
    getAll,
    create,
}
