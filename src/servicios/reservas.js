const SALAS_PERMITIDAS = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const TURNOS_PERMITIDOS = ["Mañana", "Tarde", "Noche"];

function crearServicioReservas(datosIniciales) {
  // Copia de la semilla: este es el único arreglo de reservas de la aplicación.
  const reservas = datosIniciales.map((reserva) => ({ ...reserva }));

  function listar() {
    return [...reservas];
  }

  function buscarPorId(id) {
    return reservas.find((reserva) => reserva.id === id);
  }

  function contar() {
    return reservas.length;
  }

  function crear(datos) {
    const nuevoId =
      reservas.length > 0 ? Math.max(...reservas.map((reserva) => reserva.id)) + 1 : 1;
    const nuevaReserva = { id: nuevoId, ...datos };
    reservas.push(nuevaReserva);
    return nuevaReserva;
  }

  return { listar, buscarPorId, contar, crear };
}

module.exports = { crearServicioReservas, SALAS_PERMITIDAS, TURNOS_PERMITIDOS };