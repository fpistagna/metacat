const withAsyncHandler = (fn) => {
  // Restituisce una funzione che esegue l'originale dentro un try/catch
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      // Cattura qualsiasi errore e lo rilancia per essere gestito
      // dal controller (con next) o da un altro wrapper.
      throw error;
    }
  };
};

module.exports = { withAsyncHandler };