const { cargarConfiguracion } = require("./configuracion");
const { crearApp } = require("./app");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearControladorReservas } = require("./controladores/reservas");

const reservasIniciales = [
  { id: 1, estudiante: "Camila Ríos", email: "camila@correo.com", sala: "Sala Norte", fecha: "2026-11-02", turno: "Mañana", personas: 3 },
  { id: 2, estudiante: "Tomás Herrera", email: "tomas@correo.com", sala: "Sala Sur", fecha: "2026-11-02", turno: "Tarde", personas: 2 },
  { id: 3, estudiante: "Lucía Paz", email: "lucia@correo.com", sala: "Sala Multimedia", fecha: "2026-11-03", turno: "Noche", personas: 6 },
  { id: 4, estudiante: "Martín Gómez", email: "martin@correo.com", sala: "Sala Norte", fecha: "2026-11-04", turno: "Tarde", personas: 1 },
];

function main() {
  let configuracion;
  try {
    configuracion = cargarConfiguracion();
  } catch (error) {
    console.error(`Error de configuración: ${error.message}`);
    process.exit(1);
  }

  const servicio = crearServicioReservas(reservasIniciales);
  const controlador = crearControladorReservas(servicio);
  const app = crearApp({ configuracion, controlador });

  app.listen(configuracion.puerto, (error) => {
    if (error) {
      console.error(`No se pudo iniciar el servidor: ${error.message}`);
      process.exit(1);
    }
    console.log(
      `Servidor activo en http://localhost:${configuracion.puerto} (${configuracion.entorno})`,
    );
  });
}

main();