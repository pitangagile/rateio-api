const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');

var employeeController = function(employeeSchema) {
  /**
  * Get all employees in database
  * @param {object} req
  * @param {object} res
  */
  async function getAll(req, res){
    try {
      await connectToDatabase();
      let total = await employeeSchema.find().exec();
      let items = await coastCenterSchema
        .find( queryFind )
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({ code:1 })
        .exec();
      const result = {
        data: items,
        count: total
      }
      res.status(httpStatus.Ok).json(items);
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
  Find to populate grid for interface
  * @param {object} req
  * @param {object} res
  */
  async function getGridList(req, res) {
    console.log(req.body);
    try {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      const queryFind = { $or:[
          {"Nome": { "$regex": req.query.query, "$options": "i" }},
        ]};
      await connectToDatabase();
      const total = await employeeSchema.find(queryFind).count().exec();
      let items = await employeeSchema
        .find( queryFind )
        .skip((limit * page) - limit)
        .limit(limit)
        .sort({ code:1 })
        .exec();
      const result = {
        data: items,
        count: total
      }
      res.status(httpStatus.Ok).json(result);
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
  Create a new employee
  * @param {object} req
  * @param {object} res
  */
  async function create(req, res) {
    try {
      await connectToDatabase();
      let newEmployee = new employeeSchema(req.body);
      newEmployee.isActive = true;

      newEmployee.save(function (err) {
        if(err) {
          res.status(httpStatus.InternalServerError).send('Erro: ' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      });
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  /**
  Desactive a employee
  * @param {object} req
  * @param {object} res
  */
  async function del(req, res) {
    try {
      await connectToDatabase();
      employeeSchema.findById(req.param.id, function(err, entity) {
        if(err) {
          res.status(httpStatus.NotFound).send('Funcionário não encontrado');
        }
        else {
          entity.remove(function (err) {
            if(err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      });
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  /**
  Edit a employee from settings
  * @param {object} req
  * @param {object} res
  */
  async function edit (req, res) {
    try {
      await connectToDatabase();
      employeeController.findById(req.body.id, function(err, entity) {
        if(err) {
          res.status(httpStatus.InternalServerError).send('Funcionário não encontrado');
        }
        else {
          entity.coastCenters = req.body.coastCenters;
          entity.workHours = req.body.workHours;
          entity.isPj = req.body.isPj;

          entity.save(function (err) {
            if(err) {
              res.status(httpStatus.InternalServerError).send('Erro: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      })
    } catch(e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  return {
    getAll: getAll,
    getGridList: getGridList,
    create: create,
    delete: del,
    update: edit
  }
}

module.exports = employeeController;
