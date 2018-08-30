const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');
const mongoose = require('mongoose');

var fileuploadController = function (fileuploadSchema) {

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
        .populate({path:'responsable', select: "name"})
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

      let newfileupload = new fileuploadSchema({
        'name': req.body.name,
        'responsable': mongoose.Types.ObjectId(req.body.responsable),
        'status': req.body.status,
        'registrations': req.body.registrations ? req.body.registrations.split(',') : [],
      });

      newfileupload.isActive = true;

      newfileupload.save(function (err) {
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
    getGridList: getGridList,
    create: create,
    getById: getById
  }
};

module.exports = fileuploadController;
