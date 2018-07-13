const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');

var holidayController = function (holidaySchema){
    /**
     * Busca todas as informações necessárias para carregar a página inicial de feriados
     * @param {object} request
     * @param {object} response
     */
    async function getIndexData(req, res) {
        //todo: retornar todos os anos cadastrados nos feriados.
        try{
            const selectedYear = (new Date()).getFullYear();
            const years = [];
            years.push(selectedYear);

            await connectToDatabase();
            const items = await holidaySchema.find({"date":{"$gte": new Date(selectedYear, 0, 1), "$lt": new Date(selectedYear, 11, 31)}}).exec();

            res.status(httpStatus.Ok).send({ years: years, holidays: items });
        } catch(e){
            res.status(httpStatus.InternalServerError).send('Erro:' + e);
        }
    }

    /**
     * Search holidays per year
     * @param {object} req
     * @param {object} res
     */
    async function search(req, res) {
        const year = req.query.year;
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
    async function create(req, res) {
        try{
            await connectToDatabase();
            let newHoliday = new holidaySchema({
                date: new Date(req.body.date),
                description: req.body.description,
                classification: req.body.classification,
                dayDescription: req.body.daydescription,
                percentageWorked: req.body.percentageWorked
            });

            newHoliday.save(function (err) {
                if(err) {
                    res.status(httpStatus.InternalServerError).send('Erro:' + err);
                }
                else{
                    res.status(httpStatus.Created).end();
                }
            })
        }catch(e){
            res.status(httpStatus.InternalServerError).send('Erro:' + e);
        }
    }

    /**
     * Delete a holiday
     * @param {object} req The Express Request object
     * @param {object} res The Express Response object
     */
    async function del(req, res) {
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
    async function update(req, res){
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

    return {
        getIndexData: getIndexData,
        search: search,
        create: create,
        update: update,
        del: del
    }
}

module.exports = holidayController;
