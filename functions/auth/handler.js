// @ts-check
const helper = require('../../commons/utilities');
const authLogin = require('./login');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');

/**
 * Efetua a validação do usuário e gera o token de autenticação da aplicação
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 */
function regularLogin(event, context, callback) {
  const args = helper.getPostParameters(event.body);
  const user = {username: args.username, password: args.password };
  
  authLogin.regularLogin(user).then(result => {
    const response = {
      statusCode: httpStatus.Ok,
      body: result
    };

    callback(null, response);
  }, error => {
    callback(null, { statusCode: httpStatus.Forbidden });
  });
}

/**
 * Efetua a validação do usuário no provedor e gera o token de autenticação da aplicação
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 */
function socialLogin(event, context, callback) {
  const args = helper.getPostParameters(event.body);
  const user = {username: args.username, email: args.email };
  const social = {token: args.token, issuer: args.issuer };

  authLogin.socialLogin(user, social).then(token => {
    const response = {
      statusCode: httpStatus.Ok,
      body: token
    };

    callback(null, response);
  }, error => {
    callback(new errors.RateioException(error), null);
  });
}

/**
 * Efetua a validação do token de autenticação da aplicação
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 */
function validate(event, context, callback) {
  const args = helper.getPostParameters(event.body);
  const statusCode = authLogin.validateToken(args.token) ? httpStatus.Ok : httpStatus.Unauthorized;
  const response = { statusCode: statusCode };

  callback(null, response);
}

/**
 * Cria um novo token de autenticação da aplicação baseado em um existente expirado
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 */
function refreshToken(event, context, callback) {
  const args = helper.getPostParameters(event.body);
  authLogin.refreshToken(args.token).then(newToken => {
    const response = { statusCode: httpStatus.Ok, body: newToken };
    callback(null, response);
  }, err => {
    callback(null, { statusCode: httpStatus.Unauthorized });
  });
}

module.exports = {
  regularLogin,
  socialLogin,
  validate,
  refreshToken
}