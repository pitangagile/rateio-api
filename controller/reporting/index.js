const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

const ReportingSchema = require('../../models/reporting');

/**
 * Searches all the info necessary to load the "Reportagem" page
 * @param {object} request
 * @param {object} response
 */
function getIndexData(request, response) {
    const periods = ['January/2018','February/2018','March/2018'];

    response.send({ periods: periods });
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
            let reportings = yield ReportingSchema.find();
            let result = [];
            for(var i = 0; i < reportings.length; i += 1) {
                if(reportings[i].period === period){
                    let reporting = {
                        period: reportings[i].date.getDate(),
                        costCenter: reportings[i].costCenter,
                        hours: reportings[i].hours,
                    }
                }
                result.push(reporting);
            }
            res.json(result);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Creates a new Report
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newReport = new reportingschema({
                period: req.body.date,
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
 * Deletes a report
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function delete_post(req, res) {
    console.log(req.body.id);
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield reportingschema.findByIdAndRemove(req.body.id).exec();
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
    delete_post,
}
