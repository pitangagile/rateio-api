const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment-timezone');

var periodController = function (periodSchema) {
  /**
   * Get all period in database
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      await connectToDatabase();
      let items = await periodSchema.find().exec();
      let result = [];

      moment.updateLocale(moment.locale(), {invalidDate: " "});

      for (var i = 0; i < items.length; i += 1) {
        let period = {
          _id: items[i]._id,
          description: items[i].description,
          initialDate: moment(items[i].initialDate).format('D/M/YYYY'),
          finalDate: moment(items[i].finalDate).format('D/M/YYYY'),
        }
        if (items[i].endReportingDate != undefined) {
          period.endReportingDate = moment(items[i].endReportingDate).format('D/M/YYYY');
        }
        else {
          period.endReportingDate = "";
        }
        if (items[i].endReportingManagerDate != undefined) {
          period.endReportingManagerDate = moment(items[i].endReportingManagerDate).format('D/M/YYYY');
        }
        else {
          period.endReportingManagerDate = "";
        }
        if (items[i].endReportingAdminDate != undefined) {
          period.endReportingAdminDate = moment(items[i].endReportingAdminDate).format('D/M/YYYY');
        }
        else {
          period.endReportingAdminDate = "";
        }

        result.push(period);
      }
      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  // /**
  //  * Creates a new period
  //  * @param {object} req The Express Request object
  //  * @param {object} res The Express Response object
  //  */
  async function create(req, res) {
    try {
      const descriptionUpperCase = moment(req.body.finalDate).locale('pt-BR').format('MMMM/YYYY');

      await connectToDatabase();
      let newperiod = new periodSchema({
        description: descriptionUpperCase.charAt(0).toUpperCase() + descriptionUpperCase.slice(1),
        initialDate: moment(req.body.initialDate).tz('America/Recife').toDate(),
        finalDate: moment(req.body.finalDate).tz('America/Recife').toDate(),
        endReportingDate: undefined,
        endReportingManagerDate: undefined,
        endReportingAdminDate: undefined,
        isActive: true,
      });

      newperiod.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro:' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  // /**
  //  * Delete a Period
  //  * @param {object} req The Express Request object
  //  * @param {object} res The Express Response object
  //  */
  async function del(req, res) {
    try {
      await connectToDatabase();
      const result = await periodSchema.findByIdAndRemove(req.params.id);
      result.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Ok).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function pickActivePeriod(req, res) {
    try {
      await connectToDatabase();
      const result = await periodSchema.findOne({'isActive': true});
      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  return {
    getAll: getAll,
    create: create,
    delete_period: del,
    pickActivePeriod: pickActivePeriod,
  }
}

module.exports = periodController;
