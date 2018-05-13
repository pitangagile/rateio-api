// @ts-check
const qs = require('qs');

/**
 * Obtém os valores enviados por http post
 * @param {object} [requestBody] Corpo da requisição (event.body)
 * @returns {object} Objeto JSON resultante do mapeamento dos parametros
 */
function getPostParameters(requestBody) {
  try {
    return JSON.parse(requestBody)
  } catch (e) {
    return qs.parse(requestBody);
  }
}

function getDayOfWeek(date) {
  const weekday = new Array(7);

  weekday[0] = "Domingo";
  weekday[1] = "Segunda-feira";
  weekday[2] = "Terça-feira";
  weekday[3] = "Quarta-feira";
  weekday[4] = "Quinta-feira";
  weekday[5] = "Sexta-feira";
  weekday[6] = "Sábado";

  return weekday[date.getDay()];
}

/**
 * Obtém o valor de uma propriedade de um objeto.
 *
 * @param {any} object objeto alvo
 * @param {string} property nome da propriedade. Aceita busca profunda ('nome.da.propriedade')
 * @returns o valor encontrado
 */
function getObjectPropertyValue(object, property) {
  if(typeof object === 'undefined') {
    return false;
  }

  const _index = property.indexOf('.')
  if(_index > -1) {
      return getObjectPropertyValue(object[property.substring(0, _index)], property.substr(_index + 1));
  }

  return object[property];
}

module.exports = {
  getPostParameters,
  getDayOfWeek,
  getObjectPropertyValue,
}
