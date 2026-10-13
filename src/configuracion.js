const PUERTO_PREDETERMINADO = 3000;

function leerPuerto(valor) {
  if (valor === undefined || valor === "") {
    return PUERTO_PREDETERMINADO;
  }

  const puerto = Number(valor);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PORT inválido: "${valor}". Debe ser un entero entre 1 y 65535.`);
  }
  return puerto;
}

function cargarConfiguracion(entorno = process.env) {
  const nodeEnv = entorno.NODE_ENV || "development";

  return {
    puerto: leerPuerto(entorno.PORT),
    entorno: nodeEnv,
    
    formatoRegistro: nodeEnv === "production" ? "combined" : "dev",
  };
}

module.exports = { cargarConfiguracion };