// @ts-check
const helper = require('../../commons/utilities');
const authLogin = require('./login');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');

/**
 * Efetua a validação do usuário e gera o token de autenticação da aplicação
 * @param {object} request
 * @param {object} response
 */
function regularLogin(request, response) {
  const user = {username: request.body.username, password: request.body.password };

  authLogin.regularLogin(user).then(result => {
    response.status(httpStatus.Ok).json(result);
  }, error => {
    response.status(httpStatus.Forbidden).json({error: error});
  });
}

/**
 * Efetua a validação do usuário no provedor e gera o token de autenticação da aplicação
 * @param {object} request
 * @param {object} response
 */
function socialLogin(request, response) {
  const user = {username: request.body.username, email: request.body.email };
  const social = {token: request.body.token, issuer: request.body.issuer };

  authLogin.socialLogin(user, social).then(token => {
    response.status(httpStatus.Ok).json(token);
  }, error => {
    response.status(httpStatus.Forbidden).json({error: error});
  });
}

/**
 * Efetua a validação do token de autenticação da aplicação
 * @param {object} request
 * @param {object} response
 */
function validate(request, response) {
  const statusCode = authLogin.validateToken(request.body.token) ? httpStatus.Ok : httpStatus.Unauthorized;

  response.status(statusCode).end();
}

/**
 * Cria um novo token de autenticação da aplicação baseado em um existente expirado
 * @param {object} request
 * @param {object} response
 */
function refreshToken(request, response) {
  authLogin.refreshToken(request.body.token).then(newToken => {
    response.status(httpStatus.Ok).json(newToken);
  }, err => {
    response.status(httpStatus.Unauthorized).end();
  });
}

module.exports = {
  regularLogin,
  socialLogin,
  validate,
  refreshToken
}
