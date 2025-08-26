const withLogging = (fn, logger) => {
  const functionName = fn.name;

  // Restituisce una funzione che prima imposta il logger e poi esegue l'originale
  return async function (...args) {
    if (logger) {
      logger.callerFunction = functionName;
    }
    // Esegue la funzione originale e ne restituisce il risultato (o la Promise)
    return await fn.apply(this, args);
  };
};

module.exports = { withLogging };