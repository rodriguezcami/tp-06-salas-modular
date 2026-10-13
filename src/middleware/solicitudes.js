let contadorSolicitudes = 0;


function identificarSolicitud(req, res, next) {
  contadorSolicitudes += 1;
  res.locals.solicitudId = `BIB-${String(contadorSolicitudes).padStart(4, "0")}`;
  next();
}


function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  const id = res.locals.solicitudId;

  res.on("finish", () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(
      `[${id}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracionMs.toFixed(1)} ms)`,
    );
  });

  next();
}

module.exports = { identificarSolicitud, medirDuracion };