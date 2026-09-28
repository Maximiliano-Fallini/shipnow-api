# ShipNow API

API REST backend para la gestion de logistica y envios. Permite administrar usuarios, comercios y pedidos (envios), consultar el estado de una entrega (tracking), subir documentos de usuarios y comprobantes de entrega, generar datos de prueba y registrar la actividad del servidor.

Proyecto final del curso de Backend con Node.js.

## Tecnologias

- Node.js + Express
- MongoDB + Mongoose
- Multer (carga de archivos)
- Winston (logging)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Mocha + Chai + Supertest (testing)
- Faker (generacion de datos mock)
- Docker + Docker Compose

## Arquitectura

El proyecto sigue una arquitectura por capas:

```txt
Request -> Router -> Controller -> Service -> Repository -> Model (MongoDB)
```

- Las **rutas** solo declaran endpoints y middlewares.
- Los **controllers** manejan `req`/`res` y delegan cualquier error con `next(err)`.
- Los **services** concentran la logica de negocio y lanzan los errores de dominio.
- Los **repositories** son la unica capa que accede a MongoDB (a traves de los models).
- Un **middleware global de errores** devuelve siempre el mismo formato JSON.

### Estructura de carpetas

```txt
src/
  app.js               # configuracion de Express (middlewares, rutas, swagger)
  server.js            # arranque del servidor y conexion a MongoDB
  config/
    env.js             # variables de entorno centralizadas
    db.js              # conexion a MongoDB
  constants/           # constantes del dominio (estados, prioridades, roles, documentos)
  controller/          # capa HTTP
  service/             # logica de negocio y errores de dominio
  repositories/        # acceso a MongoDB
  models/              # esquemas de Mongoose
  routes/              # definicion de rutas
  middlewares/         # manejo global de errores, 404 y upload de archivos
  mocks/               # generadores de datos simulados (faker)
  docs/                # documentacion Swagger (archivos yaml)
  utils/               # logger, respuestas y diccionario de errores
tests/                 # pruebas funcionales (Mocha + Chai + Supertest)
uploads/               # archivos subidos (no se versiona)
logs/                  # logs generados (no se versiona)
```

## Requisitos previos

- Node.js 22 o superior
- MongoDB (local, Docker o Atlas)
- Docker + Docker Compose (opcional, para correr todo en contenedores)

## Instalacion

```bash
git clone <URL_DEL_REPOSITORIO>
cd shipnow-api
npm install
```

Crear el archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env      # Linux / macOS
copy .env.example .env    # Windows
```

## Variables de entorno

Todas las variables estan centralizadas en `src/config/env.js` y documentadas en `.env.example`:

| Variable | Descripcion | Valor por defecto |
| --- | --- | --- |
| `PORT` | Puerto del servidor HTTP | 8080 |
| `NODE_ENV` | Entorno de ejecucion (`development`, `production`, `test`) | development |
| `MONGODB_URI` | Cadena de conexion a MongoDB (incluye el nombre de la base) | mongodb://localhost:27017/shipnow |
| `LOG_LEVEL` | Nivel minimo de Winston (`error`, `warn`, `info`, `http`, `debug`) | info |
| `UPLOAD_DIR` | Carpeta destino de los archivos subidos | uploads/documents |
| `MAX_FILE_SIZE_MB` | Tamano maximo permitido por archivo (en MB) | 80 |

## Ejecucion local

```bash
npm start      # inicia la API
npm run dev    # inicia la API con nodemon (desarrollo)
```

- API: http://localhost:8080
- Health check: http://localhost:8080/health
- Swagger: http://localhost:8080/api/docs

## Tests

```bash
npm test
```

Las pruebas usan una base de datos independiente (`shipnow_test`, configurable con la variable `TEST_MONGODB_URI`) que se limpia antes y despues de cada suite, por lo que no afectan la base de desarrollo. Cubren endpoints principales, casos exitosos y de error, mocks, health check, Swagger y carga de archivos.

## Documentacion Swagger

Disponible en `/api/docs`. Incluye los schemas de Usuario, Comercio, Pedido, Documento y Error, ademas de las respuestas de error para cada endpoint.

## Docker

### Con Docker Compose (recomendado)

Levanta la API y una instancia de MongoDB con `healthcheck`, de modo que la API no arranca hasta que la base esta lista:

```bash
docker compose up -d --build     # construye la imagen y levanta api + mongo
docker compose ps                # estado de los servicios
docker compose logs -f api       # logs de la API
docker compose down              # baja los contenedores (conserva los datos)
docker compose down -v           # baja y borra los datos de MongoDB
```

| Servicio | Imagen | Descripcion |
| --- | --- | --- |
| `api` | build local (`Dockerfile`) | API escuchando en el puerto 8080 |
| `mongo` | `mongo:8` | Base de datos con healthcheck (`mongosh ping`) |

Variables de entorno que recibe la API dentro de compose (definidas en `docker-compose.yml`): `PORT`, `NODE_ENV`, `MONGODB_URI` (`mongodb://mongo:27017/shipnow`), `LOG_LEVEL`, `UPLOAD_DIR` y `MAX_FILE_SIZE_MB`.

> Importante: dentro de un contenedor, `localhost` es el propio contenedor. Por eso la API no puede usar `mongodb://localhost:27017` y debe apuntar al servicio `mongo`.

### Construir y ejecutar el contenedor manualmente

```bash
docker build -t shipnow-api .
docker network create shipnow-net
docker run -d --name shipnow-mongo --network shipnow-net mongo:8
docker run -d --name shipnow-api --network shipnow-net -p 8081:8080 \
  --env-file .env \
  -e MONGODB_URI=mongodb://shipnow-mongo:27017/shipnow \
  shipnow-api
```

La imagen es multi-stage: en la primera etapa instala las dependencias de produccion (`npm ci --omit=dev`) y en la segunda copia solo el codigo necesario, se ejecuta con el usuario `node` (no root) y define un `HEALTHCHECK` contra `/health`.

## Logs

- Winston escribe en `logs/error.log` (solo errores) y `logs/combined.log` (actividad general).
- La salida por consola se habilita unicamente cuando `NODE_ENV` no es `production`.
- `GET /api/logger` (disponible solo fuera de produccion) genera un log de prueba en todos los niveles.
- La carpeta `logs/` esta incluida en `.gitignore`: los logs generados no se suben al repositorio.

## Uploads

- Los archivos se guardan en `uploads/documents` (configurable con `UPLOAD_DIR`) y sus metadatos se persisten en MongoDB.
- Se aceptan archivos PDF de hasta 80 MB (`MAX_FILE_SIZE_MB`); los archivos con otro tipo o tamano se rechazan con un error controlado.
- La carpeta `uploads/` esta en `.gitignore` y debe quedar saneada (sin archivos de pruebas locales) antes de entregar.
- Documentos de usuario: `POST /api/users/:uid/documents` (campo `document`, `type=user_document`).
- Comprobantes de entrega: `POST /api/orders/:oid/proof` (campo `proof`).

## Endpoints principales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Health check de la API |
| GET | `/api/docs` | Documentacion interactiva (Swagger) |
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear usuario |
| GET | `/api/users/:uid` | Obtener usuario por id |
| PUT | `/api/users/:uid` | Actualizar usuario |
| DELETE | `/api/users/:uid` | Eliminar usuario |
| POST | `/api/users/:uid/documents` | Subir documento del usuario (multipart, campo `document`) |
| GET | `/api/stores` | Listar comercios |
| POST | `/api/stores` | Crear comercio |
| GET | `/api/stores/:sid` | Obtener comercio por id |
| PUT | `/api/stores/:sid` | Actualizar comercio |
| DELETE | `/api/stores/:sid` | Eliminar comercio |
| GET | `/api/orders` | Listar pedidos (envios) |
| POST | `/api/orders` | Crear pedido (calcula el total y arranca en `created`) |
| GET | `/api/orders/:oid` | Obtener pedido por id |
| GET | `/api/orders/:oid/status` | Consultar estado del pedido (tracking) |
| PUT | `/api/orders/:oid/status` | Actualizar estado del pedido |
| POST | `/api/orders/:oid/proof` | Subir comprobante de entrega (multipart, campo `proof`) |
| DELETE | `/api/orders/:oid` | Eliminar pedido |
| GET | `/api/logger` | Generar logs de prueba (solo fuera de produccion) |

La referencia completa (schemas, cuerpos de request y respuestas de error) esta en `/api/docs`.

### Estados de un pedido

```txt
created -> assigned -> picked_up -> in_transit -> delivered
cancelled
```

## Modulo de mocks

Genera datos simulados consistentes con los modelos (usa faker y las constantes del proyecto). Solo esta disponible cuando `NODE_ENV` no es `production`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/mocks/mockingusers?count=10` | Genera usuarios simulados (no los guarda) |
| GET | `/api/mocks/mockingorders?count=10` | Genera pedidos simulados (no los guarda) |
| POST | `/api/mocks/createMockUser` | Crea un usuario mock en la base |
| POST | `/api/mocks/createMockUsers` | Crea N usuarios mock en la base |
| POST | `/api/mocks/createMockCustomers` | Crea N clientes mock en la base |
| POST | `/api/mocks/createMockOwners` | Crea propietarios y comercios mock |
| POST | `/api/mocks/createMockOrders` | Crea pedidos mock (requiere `customerId` y `storeId`) |
| POST | `/api/mocks/generateData` | Genera usuarios, comercios y pedidos de una sola vez |

`count` acepta valores entre 0 y 100 (maximo `MAX = 100`).

## Manejo de errores

Todas las respuestas de error respetan el mismo formato:

```json
{
  "status": "error",
  "error": "USER_NOT_FOUND",
  "message": "Usuario no encontrado"
}
```

| Codigo | HTTP | Descripcion |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Datos invalidos o incompletos |
| `INVALID_STATUS` | 400 | Estado de pedido invalido |
| `INVALID_MOCK_QUANTITY` | 400 | Cantidad invalida de mocks |
| `FILE_REQUIRED` | 400 | Debe adjuntar un archivo |
| `INVALID_FILE_TYPE` | 400 | Tipo de archivo no permitido |
| `INVALID_DOCUMENT_TYPE` | 400 | Tipo de documento invalido |
| `INVALID_TOO_LARGE` | 413 | El archivo supera el tamano maximo |
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `STORE_NOT_FOUND` | 404 | Comercio no encontrado |
| `ORDER_NOT_FOUND` | 404 | Pedido no encontrado |
| `ROUTE_NOT_FOUND` | 404 | Ruta no encontrada |
| `INTERNAL_SERVER_ERROR` | 500 | Error interno del servidor |

Los errores de Multer (archivo demasiado grande o campos inesperados) y de Mongoose (id invalido o datos que no cumplen el schema) se mapean automaticamente a estos codigos.

## Notas

- Los endpoints de mocks y logger se deshabilitan con `NODE_ENV=production`.
- Los listados estan limitados a 100 documentos para evitar respuestas demasiado grandes.
- La entrega de un pedido se representa con su estado (`status`, consultable en `/api/orders/:oid/status`) y su comprobante (`proof`).
- Antes de entregar: verificar que `uploads/` este vacia, que no haya `.env` real ni logs versionados y que `npm test` pase.
