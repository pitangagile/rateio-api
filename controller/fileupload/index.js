const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var fileuploadController = function (fileuploadSchema, manageSchema, periodSchema) {

  /**
   * Get all files in database
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      await connectToDatabase();
      let items = await fileuploadSchema.find().exec();
      res.status(httpStatus.Ok).json(items);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   Find to populate grid for interface
   * @param {object} req
   * @param {object} res
   */
  async function getGridList(req, res) {
    try {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      await connectToDatabase();
      const total = await fileuploadSchema.find().count().exec();
      let items = await fileuploadSchema
        .find()
        .populate('employees')
        .populate({path: 'responsable', select: "name"})
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({code: 1})
        .exec();
      const result = {
        data: items,
        count: total
      }
      res.status(httpStatus.Ok).json(result);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   Create a new fileupload
   * @param {object} req
   * @param {object} res
   */
  async function create(req, res) {
    try {
      await connectToDatabase();

      let period = await periodSchema.findOne({'isActive': true}, '_id').exec();

      let newfileupload = await new fileuploadSchema({
        'period': period._id,
        'name': req.body.name,
        'responsable': mongoose.Types.ObjectId(req.body.responsable),
        'status': req.body.status,
        'registrations': req.body.registrations ? req.body.registrations.split(',') : [],
      });

      console.log('newfileupload > ', newfileupload);

      await newfileupload.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      });
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  async function remove(req, res) {
    try {
      await connectToDatabase();

      let fileUpload = await fileuploadSchema.findById(req.query._id)
        .exec();

      let period = await periodSchema.findById(mongoose.Types.ObjectId(fileUpload.period)).exec();

      // Altera o período
      period.initialManageExecuted = false;
      await period.save(async function (err) {
        if (err) console.log('err > ', err)
        await fileUpload.remove(async function (err) {
          if (err) console.log('err > ', err);
          await manageSchema.remove({'period.description': period.description}).exec(function (err) {
            if (err) console.log('err > ', err)
          });
        });
      });

      res.status(httpStatus.Ok).end();
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   * Get a file in database
   * @param {object} req
   * @param {object} res
   */
  async function getById(req, res) {
    try {
      await connectToDatabase();
      let ID = req.query['ID'];
      let item = await fileuploadSchema.find({'_id': ID}).exec();
      res.set(
        {
          'Content-Type': item[0].file.contentType,
          'Content-Length': item[0].file.data.length,
        });
      res.status(httpStatus.Ok).send(new Uint8Array(item[0].file.data));
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  return {
    getAll: getAll,
    getById: getById,
    getGridList: getGridList,
    create: create,
    remove: remove,
  }
};

module.exports = fileuploadController;
