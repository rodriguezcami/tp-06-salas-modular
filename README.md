# Trabajo práctico 06

Refactorización modular de la aplicación de reservas de salas de estudio.

## Proyecto de partida y cambios

El proyecto parte de una copia funcional del TP 05 (`tp-05-salas-middleware`), sin `node_modules` ni `.git`. El TP 05 original quedó intacto en su propio repositorio.

Antes de mover código se registró el comportamiento de la base. No hizo falta reparar nada: todos los casos respondieron como correspondía.

### Línea de base (TP 05, antes de refactorizar)

| Caso | Estado | Contenido o vista | Reservas | Evidencia |
|------|--------|-------------------|----------|-----------|
| GET / | 200 | Página de inicio | 4 | `GET / 200 - 1244 bytes` |
| GET /estado | 200 | JSON con servicio, reservas y solicitudId | 4 | `GET /estado 200 - 59 bytes` |
| GET /reservas | 200 | Listado con cuatro tarjetas | 4 | `GET /reservas 200 - 2411 bytes` |
| GET /reservas/nueva | 200 | Formulario | 4 | `GET /reservas/nueva 200 - 2410 bytes` |
| GET /reservas/1 | 200 | Detalle de la reserva 1 | 4 | `GET /reservas/1 200 - 1292 bytes` |
| GET /reservas/999 | 404 | Página HTML "Reserva no encontrada" | 4 | `GET /reservas/999 404 - 1071 bytes` |
| POST /reservas inválido | 400 | Formulario con error y valores conservados | 4 (sin alta) | `POST /reservas 400` |
| POST /reservas válido | 302 y luego 200 | Redirección y listado con cinco tarjetas | 5 | `POST /reservas 302` y `GET /reservas 200` |
| GET /css/estilos.css | 200 (304 si está en caché) | Hoja de estilos | — | `GET /css/estilos.css 304` |
| GET /url-inexistente | 404 | Página HTML "Página no encontrada" | 4 | `GET /url-inexistente 404 - 1055 bytes` |

### Cambios realizados

- El código del único archivo `src/index.js` se separó en módulos de arranque, configuración, aplicación, rutas, controladores, servicio y middleware.
- El puerto y el formato de registro de Morgan ahora se configuran desde variables de entorno.
- Se agregaron Prettier y ESLint.
- No se modificaron las vistas EJS, el layout, el CSS, los datos iniciales ni la validación.

## Instalación y ejecución

```bash
npm install
npm start
```

Abrir http://localhost:3000. Para detener el servidor: `Ctrl + C`.

`npm start` funciona sin archivo `.env`, porque usa valores predeterminados. Opcionalmente, con un `.env` local se puede usar:

```bash
npm run start:local
```

Este script ejecuta `node --env-file=.env src/index.js` y requiere que exista un archivo `.env` en la raíz.

Otros comandos:

```bash
npm run format        # formatea src con Prettier
npm run format:check  # comprueba el formato sin modificar
npm run lint          # análisis estático con ESLint
npm run check         # format:check + lint
```

## Configuración del entorno

Las variables se leen una sola vez al inicio, en `src/configuracion.js`.

| Variable | Valor predeterminado | Regla |
|----------|----------------------|-------|
| `PORT` | `3000` | Entero entre 1 y 65535. Cualquier otro valor detiene el arranque con un mensaje claro. |
| `NODE_ENV` | `development` | Con `production` Morgan usa el formato `combined`; en cualquier otro caso usa `dev`. |

El valor de `NODE_ENV` solo cambia el formato del registro de Morgan; no activa ningún otro comportamiento.

El archivo `.env.example` está versionado con valores no secretos. El archivo `.env` real está excluido por `.gitignore` y no se publica.

Para probar un puerto alternativo en PowerShell:

```powershell
$env:PORT = "3001"
npm start
Remove-Item Env:PORT
```

## Mapa de módulos y dependencias

| Archivo | Responsabilidad | No hace |
|---------|-----------------|---------|
| `src/index.js` | Define las reservas iniciales, crea el servicio y el controlador, lee la configuración, crea la app y escucha el puerto | Declarar rutas ni validar formularios |
| `src/configuracion.js` | Lee y valida `PORT` y `NODE_ENV` | Crear Express ni imprimir secretos |
| `src/app.js` | Configura vistas y pipeline de middleware, monta el router y define el 404 final | Escuchar el puerto ni tocar el arreglo de reservas |
| `src/rutas/reservas.js` | Relaciona método y camino con middleware y controlador | Repetir `/reservas` en las rutas internas |
| `src/controladores/reservas.js` | Lee parámetros, renderiza vistas, responde JSON, responde 404 y redirige | Escuchar el puerto ni guardar el arreglo |
| `src/servicios/reservas.js` | Lista, busca, cuenta y crea reservas en memoria | Usar `req`, `res`, EJS ni códigos HTTP |
| `src/middleware/solicitudes.js` | `identificarSolicitud` y `medirDuracion` | — |
| `src/middleware/reservas.js` | `prepararAreaReservas` y `validarReserva` | Perder `next()` ni continuar después de responder 400 |

Las vistas (`views/`) y los recursos estáticos (`public/`) se conservan igual que en el TP 05.

Dependencias entre módulos:

```text
index.js
 ├─ configuracion.js
 ├─ servicios/reservas.js
 ├─ controladores/reservas.js ──→ servicios/reservas.js (solo constantes)
 └─ app.js
     ├─ middleware/solicitudes.js
     └─ rutas/reservas.js
         └─ middleware/reservas.js ──→ servicios/reservas.js (solo constantes)
```

### Explicación

- **Por qué el servicio no usa `res`:** el servicio solo trabaja con datos (listar, buscar, contar y crear). No sabe si lo llama una página, una API o una prueba, y por eso no puede ni debe conocer `req`, `res` ni códigos HTTP. Eso lo hace más simple de entender y de reutilizar.
- **Qué hace el controlador:** es el intermediario entre HTTP y los datos. Lee el parámetro `id` de la URL, le pide al servicio lo que necesita, y decide qué responder: renderizar una vista, enviar JSON, devolver 404 o redirigir.
- **Por qué el router declara caminos relativos:** el router se monta con `app.use("/reservas", ...)`, que antepone `/reservas` a todo lo de adentro. Por eso dentro del router las rutas son `/`, `/nueva` y `/:id`. Si se repitiera `/reservas`, la URL quedaría `/reservas/reservas`.
- **Dónde vive el único arreglo de reservas:** dentro de `crearServicioReservas`, en `src/servicios/reservas.js`. Se crea una sola instancia en `index.js` y se comparte con el controlador, así que el listado, el detalle, `/estado` y el POST usan el mismo arreglo.

## Pipeline y contrato de rutas

Orden real de `src/app.js`:

```text
Morgan -> identificarSolicitud -> medirDuracion -> expressLayouts -> express.static
 -> express.urlencoded -> express.json -> rutas de aplicación -> router /reservas -> 404
```

`express.static` está **después** de Morgan, así que los recursos estáticos sí quedan registrados en la terminal (se ven las líneas de `/css/estilos.css`).

### POST válido

```text
POST /reservas
 ↓ morgan(formatoRegistro)
 ↓ identificarSolicitud
 ↓ medirDuracion
 ↓ expressLayouts
 ↓ express.urlencoded
 ↓ router de reservas (montado en /reservas)
 ↓ prepararAreaReservas
 ↓ validarReserva
 ↓ controlador.crear  → servicio.crear
 ↓ 302 /reservas
 ↓ finish: ID + estado + duración
```

### POST inválido

```text
POST /reservas
 ↓ morgan(formatoRegistro)
 ↓ identificarSolicitud
 ↓ medirDuracion
 ↓ expressLayouts
 ↓ express.urlencoded
 ↓ router de reservas
 ↓ prepararAreaReservas
 ↓ validarReserva → res.status(400).render("reservas/nueva")  ← termina acá
 ↓ finish: ID + 400 + duración
```

`controlador.crear` no se ejecuta: `validarReserva` responde y no llama a `next()`.

### Contrato de rutas

| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/` | 200, página de inicio |
| GET | `/estado` | 200, JSON con `servicio`, `reservas` y `solicitudId` |
| GET | `/reservas` | 200, listado (o estado vacío) |
| GET | `/reservas/nueva` | 200, formulario |
| GET | `/reservas/:id` | 200, detalle; 404 HTML si no existe |
| POST | `/reservas` | 302 a `/reservas` si es válido; 400 si es inválido |
| GET | `/css/estilos.css` | 200 |
| cualquier otra | — | 404 HTML |

`/nueva` se registra antes de `/:id` para que "nueva" no se interprete como un identificador. `express.urlencoded` está antes del validador porque es el que llena `req.body`.

## Matriz antes/después

| Caso | Esperado | Antes (TP 05) | Después (TP 06) |
|------|----------|---------------|-----------------|
| Inicio y CSS | 200 | 200, 1244 bytes; CSS 304; ID visible en el pie | Igual: 200, 1244 bytes; CSS 304 |
| Estado inicial | 200 | 200, JSON con 4 reservas, 59 bytes | Igual: 200, 4 reservas, 59 bytes |
| Listado y detalle existente | 200 | 200 (2411 y 1292 bytes) | Igual: 200 (2411 y 1292 bytes) |
| Detalle inexistente | 404 | 404 HTML, 1071 bytes | Igual: 404 HTML, 1071 bytes; el servidor sigue activo |
| Formulario | 200 | 200, 2410 bytes | Igual: 200, 2410 bytes |
| POST vacío | 400 | 400, mensaje y sin alta | Igual: 400, sin alta |
| Sala no permitida | 400 | Misma validación que TP 05 | 400, sin alta |
| Email sin @ | 400 | Misma validación que TP 05 | 400, sin alta |
| Personas 0, 7 o fraccionarias | 400 | Misma validación que TP 05 | 400, sin alta |
| POST válido | 302 y luego 200 | 302, luego 200; `/estado` pasa a 5 | Igual: 302, luego 200; `/estado` pasa a 5 |
| URL inexistente | 404 | 404 HTML, 1055 bytes | Igual: 404 HTML, 1055 bytes |
| Reinicio | 200 | Vuelve a 4 reservas | Igual: vuelve a 4 reservas |
| Puerto alternativo | 200 | No configurable (3000 fijo) | Responde en 3001 con `PORT=3001` |
| Puerto inválido | No inicia | No configurable | Con `PORT=abc` o `PORT=70000` muestra el error de configuración y no inicia |

Morgan y la medición propia siguen mostrando los estados 200, 302, 400 y 404 en la terminal, con el ID de solicitud consecutivo.

## Formato y análisis estático

Se instalaron como dependencias de desarrollo:

```bash
npm install --save-dev prettier eslint @eslint/js
```

- **Prettier** formatea el código de `src` con un estilo uniforme.
- **ESLint** (configurado en `eslint.config.js` para archivos CommonJS de `src`) detecta errores comunes, como variables sin usar.

Comandos ejecutados y resultados:

| Comando | Resultado |
|---------|-----------|
| `npm install` | Sin errores; se generó `package-lock.json` |
| `npm run format` | Archivos de `src` formateados |
| `npm run check` | `format:check` y `lint` terminan sin errores |
| `npm start` | Servidor activo en el puerto 3000 |

El verificador estático no reemplaza la matriz de pruebas HTTP: ESLint y Prettier no comprueban que las rutas respondan bien.

## Persistencia temporal y límites

Las cuatro reservas iniciales se definen en `src/index.js` y se copian al arreglo interno del servicio al crearlo. Las reservas nuevas se agregan a ese único arreglo, que vive en la memoria del proceso, y no se escriben en ningún archivo ni base de datos.

Al reiniciar el servidor el proceso empieza de cero y vuelve a cargar solo las cuatro reservas iniciales, por lo que las altas desaparecen.

Límites del trabajo: no hay base de datos, escritura de archivos, autenticación, manejo centralizado de errores ni pruebas automáticas, porque están fuera del alcance de este TP.