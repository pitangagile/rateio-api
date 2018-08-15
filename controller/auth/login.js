// @ts-check
const variables = require('../../commons/variables');
const errors = require('../../commons/errors');
const request = require('request');
const jwt = require('jsonwebtoken');

/**
 * Valida as credenciais do usuário
 * @param {{username: string, password: string}} [credencials] Credenciais do usuário
 * @returns {Promise<{user: any, token: string}>} Dados do usuário retornados do provedor
 */
function regularLogin(credencials) {
  return new Promise((resolve, reject) => {
    try {
      const user = { email: undefined, username: credencials.username /* ... */ };
      const token = createRateioToken({ email: user.username });

      resolve({user, token});
    } catch (e) {
      reject('AUTH0001');
    }
  });
}

/**
 * Valida o token no provedor
 * @param {string} [email] E-mail do usuário
 * @param {string} [socialToken] Token obtido no cliente
 * @returns {Promise<{email: string}>} Dados do usuário retornados do provedor
 */
function validateWithProvider(email, socialToken) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      qs: { access_token: socialToken }
    };

    request(variables.social.google.authValidateUri, requestOptions, (error, response, body) => {
      if(!error && response.statusCode == 200){
        let jsonBody = JSON.parse(body);
        let isSameUser = jsonBody.email && jsonBody.email.toLocaleLowerCase().trim() === email.toLocaleLowerCase().trim();
        if(isSameUser) {
          resolve({email});
        } else {
          reject();
        }
      } else {
        reject(error);
      }
    });
  });
}

/**
 * Cria token JWT de autenticação da aplicação
 * @param {{email: string}} [profile] Perfil do usuário
 * @returns {string} Token JWT
 */
function createRateioToken(profile) {
  let token = jwt.sign(profile, variables.jwt.privateKey, {
    //algorithm: '',
    expiresIn: variables.jwt.expiresIn,
    // notBefore: '',
    // audience: '',
    issuer: variables.jwt.issuer
    // jwtid: '',
    // subject: '',
    // noTimestamp: '',
    // header: '',
    // keyid: '',
    // mutatePayload: ''
  });

  return token;
}

/**
 * Cria um novo token de autenticação da aplicação baseado em um existente expirado
 * @param {string} [token] Token de autenticação da aplicação expirado
 * @returns {Promise<string>} Novo token de autenticação da aplicação
 */
function refreshToken(token) {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      const {email} = jwt.verify(token, variables.jwt.privateKey);
      const newToken = createRateioToken({email});
      resolve(newToken);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Valida o usuário cria o token de autenticação da aplicação (JWT)
 * @param {{username: string, email: string}} [user] Dados do usuário
 * @param {{token: string, issuer: string}} [social] Dados do provedor
 * @returns {Promise<string>} Token JWT de autenticação da aplicação
 */
function socialLogin(user, social) {
  return new Promise((resolve, reject) => {
    validateWithProvider(user.email, social.token).then(profile => {
      if(profile.email.toLowerCase().endsWith(`@${variables.pitang.domain}`)){
        resolve(createRateioToken(profile));
      } else {
        reject('AUTH0003');
      }
    }, error => {
      reject('AUTH0002');
    });
  });
}

/**
 * Valida o token JWT
 * @param {string} [token] Token JWT de autenticação da aplicação
 * @returns {boolean} Se true se for valido ou false caso contrário
 */
function validateToken(token) {
  try {
    let decoded = jwt.verify(token, variables.jwt.privateKey);
    return true;
  } catch(e) {
    return false;
  }
}

module.exports = {
  regularLogin,
  socialLogin,
  validateToken,
  refreshToken
}
