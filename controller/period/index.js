const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

/**
 * Busca todos os periodo do banco de dados
 * @param {object} req
 * @param {object} res
 */
function getAll(req, res) {
    connectToDatabase()
    .then(() => {
        co(function*() {
            let periods = yield periodSchema.find({isActive: true}).exec();
            res.send(periods);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Creates a new period
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newperiod = new periodSchema({
                initiadate: req.body.initialdate,
                finaldate: req.body.finaldate,
                closuredate: req.body.closuredate,
                generationdate: req.body.generationdate,
                isActive: true,
            });
            newperiod.save().then(() => {
                res.status(httpStatus.Ok).send("Periodo incluído com sucesso!").end();
            }).catch(error => {
                res.status(httpStatus.InternalServerError).json({error: error}).end();
            });
        }).catch((error) => {
            res.status(httpStatus.InternalServerError).json({error: error}).end();
        });
    });
}
