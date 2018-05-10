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

module.exports = {
  getPostParameters,
  getDayOfWeek,
}
