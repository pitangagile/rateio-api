const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes');
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment-business-days');

var periodController = function (periodSchema, holidaySchema, fileUploadSchema) {

  moment.updateLocale('br',
    {
      workingWeekdays: [1, 2, 3, 4, 5]
    }
  );

  /**
   * Get all period in database
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      await connectToDatabase();

      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      const queryFind = {
        $or: [
          {"description": {"$regex": req.query.query, "$options": "i"}},
        ]
      };

      console.log('req.query.query > ', req.query.query);

      let total = await periodSchema.find(queryFind).count().exec();
      let items = await periodSchema
        .find(queryFind)
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();

      const result = {
        data: items,
        count: total
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function findAllPeriods(req, res) {
    try {
      await connectToDatabase();

      let items = await periodSchema
        .find()
        .sort({code: 1})
        .exec();

      res.status(httpStatus.Ok).json(items);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  async function pickActivePeriod(req, res) {
    try {
      await connectToDatabase();

      const item = await periodSchema.findOne({'isActive': true});

      const result = {
        data: item
      };

      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function calculateTotalBusinessDaysByActivePeriod(req, res) {
    try {
      await connectToDatabase();

      var period = await periodSchema.findOne({'isActive': true}).exec();

      var qtdBusinessDays = moment(period.finalDate, 'YYYY-MM-DD').businessDiff(moment(period.initialDate, 'YYYY-MM-DD'));
      var absQtdBusinessDays = qtdBusinessDays - await getQtdFullHolidaysInActivePeriod(period) - (0.5 * await getQtdHalfHolidaysInActivePeriod(period));

      const result = {
        data: absQtdBusinessDays
      };

      res.status(httpStatus.Ok).json(result);

    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function getQtdHalfHolidaysInActivePeriod(period) {
    try {
      await connectToDatabase();

      const queryFindHalfHolidays = {
        $and: [
          {'percentageWorked': [50]},
        ],
        'date': {'$gte': period.initialDate, '$lt': period.finalDate}
      };

      var halfHolidays = await holidaySchema.find(queryFindHalfHolidays).exec();

      var qtdBusinessDaysAndHalfHolidays = 0;

      for (var i = 0; i < halfHolidays.length; i++) {
        if (moment(halfHolidays[i].date, 'YYYY-MM-DD').isBusinessDay()) {
          qtdBusinessDaysAndHalfHolidays += 1;
        }
      }

      return qtdBusinessDaysAndHalfHolidays;
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function getQtdFullHolidaysInActivePeriod(period) {
    try {
      await connectToDatabase();

      const queryFindFullHolidays = {
        $and: [
          {'percentageWorked': [0]},
        ],
        'date': {'$gte': period.initialDate, '$lt': period.finalDate}
      };
      var fullHolidays = await holidaySchema.find(queryFindFullHolidays).exec();

      var qtdBusinessDaysAndFullHolidays = 0;

      for (var i = 0; i < fullHolidays.length; i++) {
        if (moment(fullHolidays[i].date, 'YYYY-MM-DD').isBusinessDay()) {
          qtdBusinessDaysAndFullHolidays += 1;
        }
      }

      return qtdBusinessDaysAndFullHolidays;

    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function findAllPeriodsWithoutFile(req, res) {
    try {
      await connectToDatabase();

      periodsWithFile = [];

      let files = await fileUploadSchema.find({}).populate('period').exec();

      for (var i = 0; i < files.length; i++) {
        periodsWithFile.push(files[i].period._id);
      }

      const queryFind = {
        '_id': {$nin: periodsWithFile}
      };

      let periods = await periodSchema.find(queryFind).exec();

      res.status(httpStatus.Ok).json(periods);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  return {
    getAll: getAll,
    findAllPeriods: findAllPeriods,
    pickActivePeriod: pickActivePeriod,
    calculateTotalBusinessDaysByActivePeriod: calculateTotalBusinessDaysByActivePeriod,
    getQtdHalfHolidaysInActivePeriod: getQtdHalfHolidaysInActivePeriod,
    getQtdFullHolidaysInActivePeriod: getQtdFullHolidaysInActivePeriod,
    findAllPeriodsWithoutFile: findAllPeriodsWithoutFile,
  }
};

module.exports = periodController;
