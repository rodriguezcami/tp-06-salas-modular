const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const { identificarSolicitud, medirDuracion } = require("./middleware/solicitudes");
const { crearRouterReservas } = require("./rutas/reservas");

function crearApp({ configuracion, controlador }) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");

  
  app.use(morgan(configuracion.formatoRegistro));
  app.use(identificarSolicitud);
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  
  app.get("/", controlador.inicio);
  app.get("/estado", controlador.estado);


  app.use("/reservas", crearRouterReservas(controlador));

  
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = { crearApp };