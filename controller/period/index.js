const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment')
const periodSchema = require('../../models/period');
/**
 * Busca todos os periodo do banco de dados
 * @param {object} req
 * @param {object} res
 */
function getAll(req, res) {
    connectToDatabase()
    .then(() => {
        co(function*() {
            let periods = yield periodSchema.find().exec();
            let result = [];
            for(var i = 0; i < periods.length; i += 1) {

                let period = {
                    initialdate: moment(periods[i].initialdate).format('D/M/YYYY'),
                    finaldate: moment(periods[i].finaldate).format('D/M/YYYY'),
                    closuredate: null,
                    generationdate: null,
                }
                result.push(period);
                console.log(period)
            }
            res.json(result);
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

    const initialspltdate = req.body.initialdate.split(' ');
    const initialyear = parseInt(initialspltdate[2]);
    const initialmonth = parseInt(initialspltdate[1]);
    const initialday = parseInt(initialspltdate[0]);

    const finalspltdate = req.body.finaldate.split(' ');
    const finalyear = parseInt(finalspltdate[2]);
    const finalmonth = parseInt(finalspltdate[1]);
    const finalday = parseInt(finalspltdate[0]);
    console.log(initialspltdate ,finalspltdate);

    connectToDatabase().then(() => {
        co(function* () {
            let newperiod = new periodSchema({
                initialdate: new Date(initialyear, initialmonth, initialday),
                finaldate: new Date(finalyear, finalmonth, finalday),
                closuredate: null,
                generationdate: null,
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

/**
 * Delete a Period
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function delete_period(req, res) {
    if (!req.body.id) res.send('Erro: object id not specified');
    else connectToDatabase().then(() => {
        co(function* () {
            const result = yield periodSchema.findByIdAndRemove(req.body.id);
            result.save().then(() => {
                res.status(httpStatus.Ok).end();
            }).catch((error) => {
                res.send('Erro:' + error);
            });
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    }).catch((error) => {
        res.send('Erro:' + error);
    });
}

module.exports = {
    getAll,
    create,
    delete_period,
}
