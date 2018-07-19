const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');

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
   Create a new fileupload
   * @param {object} req
   * @param {object} res
   */
  async function create(req, res) {
    try {
      await connectToDatabase();
      let newfileupload = new fileuploadSchema(req.body);
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
  return {
    getAll: getAll,
    create: create
  }
};

module.exports = fileuploadController;
