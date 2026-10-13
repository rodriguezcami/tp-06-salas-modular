const { SALAS_PERMITIDAS, TURNOS_PERMITIDOS } = require("../servicios/reservas");

function crearControladorReservas(servicio) {
  function inicio(req, res) {
    res.render("inicio", { titulo: "Inicio" });
  }

  function estado(req, res) {
    res.json({
      servicio: "activo",
      reservas: servicio.contar(),
      solicitudId: res.locals.solicitudId,
    });
  }

  function listar(req, res) {
    res.render("reservas/lista", { titulo: "Reservas", reservas: servicio.listar() });
  }

  function formulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: [],
      valores: {},
      salasPermitidas: SALAS_PERMITIDAS,
      turnosPermitidos: TURNOS_PERMITIDOS,
    });
  }

  function detalle(req, res) {
    const id = Number(req.params.id);
    const reserva = servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: `No existe una reserva con el identificador «${req.params.id}».`,
      });
    }

    res.render("reservas/detalle", { titulo: `Reserva #${reserva.id}`, reserva });
  }

  function crear(req, res) {
    servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  return { inicio, estado, listar, formulario, detalle, crear };
}

module.exports = { crearControladorReservas };