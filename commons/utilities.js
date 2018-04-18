// @ts-check
const qs = require('qs');

/**
 * Obtém os valores enviados por http post
 * @param {object} [requestBody] Corpo da requisição (event.body)
 * @returns {object} Objeto JSON resultante do mapeamento dos parametros
 */
function getPostParameters(requestBody){
  try {
    return JSON.parse(requestBody)
  } catch(e) {
    return qs.parse(requestBody);
  }
}

module.exports = {
  getPostParameters
}