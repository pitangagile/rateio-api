// @ts-check

/**
 * Classe de erro base
 * @param {string} [code] Código do erro
 * @param {string} [name] Nome do erro
 */
function RateioException(code, name = 'RateioException', inner = undefined) {
  /** @type {string} */
  this.message = undefined;
  /** @type {string} */
  this.name = name;
  /** @type {string} */
  this.code = code;
  /** @type {RateioException} */
  this.innerException = inner;

  if(RateioErrors.hasOwnProperty(code)){
    this.message = RateioErrors[code];
  }
}

const RateioErrors = {
  AUTH0001: 'Descrição do erro AUTH0001',
  AUTH0002: 'Descrição do erro AUTH0002',
  AUTH0003: 'Descrição do erro AUTH0003'
}

module.exports = {
  RateioException,
  RateioErrors
}