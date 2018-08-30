const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const connectToDatabase = require('../../commons/database');

var coastController = function (costCenterSchema) {
  /**
   * Find all active coast centers
   * @param {object} req
   * @param {object} res
   */
  async function getAll(req, res) {
    try {
      const limit = parseInt(req.query.limit);
      const page = parseInt(req.query.page);

      const queryFind = {
        $or: [
          {"code": {"$regex": req.query.query, "$options": "i"}},
          {"description": {"$regex": req.query.query, "$options": "i"}}
        ]
      };
      await connectToDatabase();
      const total = await costCenterSchema.find(queryFind).count().exec();
      let items = await costCenterSchema
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

  /**
   * Creates a new Coast Center
   * @param {object} req The Express Request object
   * @param {object} res The Express Response object
   */
  async function create(req, res) {
    try {
      await connectToDatabase();
      let newCostCenter = new costCenterSchema(req.body);
      newCostCenter.isActive = true;

      newCostCenter.save(function (err) {
        if (err) {
          res.status(httpStatus.InternalServerError).send('Erro:' + err);
        }
        else {
          res.status(httpStatus.Created).end();
        }
      })
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  /**
   * Edit a Coast Center
   * @param {object} req The Express Request object
   * @param {object} res The Express Response object
   */
  async function edit(req, res) {
    try {
      await connectToDatabase();
      costCenterSchema.findById(req.body.id, function (err, entity) {
        if (err) {
          res.status(httpStatus.NotFound).send('Centro de custo não encontrado');
        }
        else {
          entity.code = req.body.code;
          entity.description = req.body.description;
          entity.isActive = true;

          entity.save(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Falha ao atualizar centro de custo');
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      })
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Falha na edição');
    }
  }

  /**
   * Delete a Coast Center
   * @param {object} req The Express Request object
   * @param {object} res The Express Response object
   */
  async function delete_center(req, res) {
    try {
      await connectToDatabase();
      costCenterSchema.findById(req.params.id, function (err, entity) {
        if (err) {
          res.status(httpStatus.NotFound).send('Centro de custo não encontrado');
        }
        else {
          entity.remove(function (err) {
            if (err) {
              res.status(httpStatus.InternalServerError).send('Falha ao remover o centro de custo informado: ' + err);
            }
            else {
              res.status(httpStatus.Ok).end();
            }
          })
        }
      })
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro: ' + e);
    }
  }

  /**
   * Create all coast center (initial load)
   * @param {object} req The Express Request object
   * @param {object} res The Express Response object
   */
  async function createall(req, res) {
    console.log('Executou o criar todos');
    try {
      await connectToDatabase();
      if (req.body == undefined && req.body.length == 0) {
        res.status(httpStatus.InternalServerError).send('Parâmetros de cadastro inválidos');
      }

      let saves = [];
      for (var i = 0; i < req.body.length; i += 1) {
        let costCenter = new costCenterSchema({
          code: req.body[i].codigo,
          description: req.body[i].descricao,
          isActive: true,
        });
        console.log('Cadastrando: ' + costCenter.description);
        await costCenter.save();
      }
      res.status(httpStatus.Ok).send('Centros de custos adicionados con sucesso!');
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Falha na carga dos Centros');
    }
  }

  /**
   Find to populate grid for interface
   * @param {object} req
   * @param {object} res
   */
  async function findById(req, res) {
    try {
      await connectToDatabase();

      let _id = req.query._id;
      let costCenter = await costCenterSchema.findById(_id).exec();

      res.status(httpStatus.Ok).json(costCenter);
    } catch (e) {
      res.status(httpStatus.InternalServerError).send('Erro:' + e);
    }
  }

  return {
    getAll: getAll,
    create: create,
    update: edit,
    delete_center: delete_center,
    createall: createall,
    findById: findById,
  }
}


module.exports = coastController;
