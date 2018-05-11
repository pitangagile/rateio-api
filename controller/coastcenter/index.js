const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

const coastCenterSchema = require('../../models/coastcenter');

/**
 * Busca todos os centros de custo do banco de dados
 * @param {object} req
 * @param {object} res
 */
function getAll(req, res) {
    connectToDatabase()
    .then(() => {
        co(function*() {
            let coastCenters = yield coastCenterSchema.find({isActive: true}).exec();
            res.send(coastCenters);
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

/**
 * Creates a new Coast Center
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function create(req, res) {
    connectToDatabase().then(() => {
        co(function* () {
            let newCoastCenter = new coastCenterSchema({
                code: req.body.code,
                description: req.body.description,
                isActive: true,
            });
            newCoastCenter.save().then(() => {
                res.status(httpStatus.Ok).send("Centro de custo incluído com sucesso!").end();
            }).catch(error => {
                res.status(httpStatus.InternalServerError).json({error: error}).end();
            });
        }).catch((error) => {
            res.status(httpStatus.InternalServerError).json({error: error}).end();
        });
    });
}

/**
 * Edit a Coast Center
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function edit(req, res) {
    console.log(req.body.id);
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield coastCenterSchema.findByIdAndUpdate(req.body.id, update = {code: req.body.code , description: req.body.description, isActive: true}, {new: true});
            result.save().then(awdas => {
                res.status(httpStatus.Ok).send("Centro de custo editado com sucesso!").end();
            }).catch(error => {
                res.status(httpStatus.InternalServerError).json({error: error}).end();
            });
        }).catch((error) => {
            res.status(httpStatus.InternalServerError).json({error: error}).end();
        });
    });
}

/**
 * Delete a Coast Center
 * @param {object} req The Express Request object
 * @param {object} res The Express Response object
 */
function delete_center(req, res) {
    console.log(req.body.id);
    connectToDatabase().then(() => {
        co(function* () {
            const result = yield coastCenterSchema.findById(req.body.id);
            result.isActive = false;
            result.save();
            res.status(httpStatus.Ok).end();
            console.log(result) // eslint-disable-line
        }).catch((error) => {
            res.send('Erro:' + error);
        });
    });
}

module.exports = {
    getAll,
    create,
    edit,
    delete_center,
}
