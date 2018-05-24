const utilities = require('../../commons/utilities');
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
    const years = ['2018'];

    response.send({ years: years });
}

/**
 * Search holidays per year
 * @param {object} req
 * @param {object} res
 */
function search(req, res) {
    const year = req.body.year;
    console.log('Ano recebido: ' + year);
    if(year === undefined){
        res.status(httpStatus.BadRequest).send('Ano não informado!');
        return;
    }
    connectToDatabase().then(() => {
        co(function* () {
            let holidays = yield HolidaySchema.find();
            let result = [];
            for(var i = 0; i < holidays.length; i += 1) {
                let holiday = {
                    day: holidays[i].date.getDate(),
                    month: holidays[i].date.getMonth() + 1,
                    year: holidays[i].date.getFullYear(),
                    dayOfWeek: utilities.getDayOfWeek(holidays[i].date),
                    description: holidays[i].description,
                    daydescription: holidays[i].daydescription,
                    classification: holidays[i].classification,
                }

                result.push(holiday);
            }
            res.json(holidays);
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
    const spltdate = req.body.date.toString().split('-');
    const year = parseInt(spltdate[0]);
    const month = parseInt(spltdate[1]) - 1;
    const day = parseInt(spltdate[2]);
    console.log("ano:" + year + " mes:" + month + " dia:" + day);

    connectToDatabase().then(() => {
        co(function* () {
            let newHoliday = new HolidaySchema({
                date: new Date(year, month, day),
                description: req.body.description,
                classification: req.body.classification,
                daydescription: req.body.daydescription,
                percentageWorked: 0,
            });

            newHoliday.save().then(() => {
                res.status(httpStatus.Ok).send("Feriado incluído com sucesso!").end()
            }).catch(error => {
                res.status(httpStatus.InternalServerError).json({error: error}).end();
            });
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Delete a holiday
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function delete_post(req, res) {
    console.log(req.body.id);
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield HolidaySchema.findByIdAndRemove(req.body.id).exec();
            res.status(httpStatus.Ok).end();
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Update a holiday
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function update(req, res){
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield HolidaySchema.findByIdAndUpdate(req.body.id,
                update = {
                    date: new Date(req.body.date)
                }, {new: true});
            result.save().then(success => {
                res.status(httpStatus.Ok).send("Feriado atualizado com sucesso!").end();
            }).catch(error => {
                res.status(httpStatus.InternalServerError).json({error: error}).end();
            });
        }).catch((error) => {
            res.status(httpStatus.InternalServerError).json({error: error}).end();
        });
    });
}

module.exports = {
    getIndexData,
    search,
    create,
    delete_post,
    update
}
