const { SALAS_PERMITIDAS, TURNOS_PERMITIDOS } = require("../servicios/reservas");


function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}


function validarReserva(req, res, next) {
  const body = req.body || {};

  const estudiante = String(body.estudiante ?? "").trim();
  const email = String(body.email ?? "").trim();
  const sala = String(body.sala ?? "").trim();
  const fecha = String(body.fecha ?? "").trim();
  const turno = String(body.turno ?? "").trim();
  const personasTexto = String(body.personas ?? "").trim();
  const personas = Number(personasTexto);

  const errores = [];

  if (!estudiante) errores.push("El nombre del estudiante es obligatorio.");
  if (!email) {
    errores.push("El email es obligatorio.");
  } else if (!email.includes("@")) {
    errores.push("El email debe contener @.");
  }
  if (!sala) {
    errores.push("Elegí una sala.");
  } else if (!SALAS_PERMITIDAS.includes(sala)) {
    errores.push("La sala elegida no está permitida.");
  }
  if (!fecha) errores.push("La fecha es obligatoria.");
  if (!turno) {
    errores.push("Elegí un turno.");
  } else if (!TURNOS_PERMITIDOS.includes(turno)) {
    errores.push("El turno elegido no está permitido.");
  }
  if (personasTexto === "" || !Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push("La cantidad de personas debe ser un número entero entre 1 y 6.");
  }

 
  if (errores.length > 0) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores,
      valores: { estudiante, email, sala, fecha, turno, personas: personasTexto },
      salasPermitidas: SALAS_PERMITIDAS,
      turnosPermitidos: TURNOS_PERMITIDOS,
    });
  }


  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}

module.exports = { prepararAreaReservas, validarReserva };