const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const reportingSchema = require('../../models/reporting');

/**
 * Searches all the info necessary to load the "Reportagem" page
 * @param {object} request
 * @param {object} response
 */
function getIndexData(request, response) {
    connectToDatabase().then(() => {
        co(function* () {
            let reportings = yield reportingSchema.find();
            let result = reportings.map(data => data.period);
            response.json(result);
        }).catch((error) => {
            response.send('Erro:' + error);
        });
    });
}

/**
 * Creates a new reporting
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newReport = new reportingSchema({
                period: req.body.period,
                costCenter: req.body.costCenter,
                hours: req.body.hours,
            });
            newReport.save();
            res.status(httpStatus.Ok).send("Reportagem incluída com sucesso!").end();
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Search reportings per date
 * @param {object} req
 * @param {object} res
 */
function search(req, res) {
    const period = req.body.period;

    if(period === undefined){
        res.status(httpStatus.BadRequest).send('Período não informado!');
        return;
    }
    connectToDatabase().then(() => {
        co(function* () {
            let reportings = yield reportingSchema.find();
            let result = reportings.filter(data => data.period === period);
            res.json(result);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

function update(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let reporting = yield reportingSchema.findOneAndUpdate({"_id" :  req.body.id}, { $set: { "hours" : req.body.hours } }).exec();
            res.send(reporting);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    })
}

/**
 * Creates a new Report
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newReport = new reportingSchema({
                period: req.body.period,
                costCenter: req.body.costCenter,
                hours: req.body.hours,
            });

            newReport.save();
            res.status(httpStatus.Ok).send("Reportagem incluída com sucesso!").end();
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Busca todos as reportagens do banco de dados
 * @param {object} req
 * @param {object} res
 */
function getAll(req, res){
    connectToDatabase()
    .then(() => {
        co(function*() {
            let reporting = yield reportingSchema.find().exec();
            res.send(reporting);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Deletes a report
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function deletePost(req, res) {
    console.log(req.body.id);
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield reportingSchema.findByIdAndRemove(req.body.id).exec();
            res.status(httpStatus.Ok).end();
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

module.exports = {
    getIndexData,
    search,
    create,
    deletePost,
    getAll,
    update,
}
