# ShipNow API

API REST para gestionar envíos: usuarios, comercios, pedidos, seguimiento del estado de la entrega, subida de documentos y comprobantes, datos de prueba y logs.

Proyecto final del curso de Backend con Node.js.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- Multer (subida de archivos)
- Winston (logs)
- Swagger (swagger-jsdoc y swagger-ui-express)
- Mocha + Chai + Supertest (tests)
- Faker (datos mock)
- Docker + Docker Compose

## Arquitectura

El proyecto está armado por capas, tratando de que cada una haga una sola cosa:

    Request -> Router -> Controller -> Service -> Repository -> Model (MongoDB)

- **Router**: solo declara las rutas y sus middlewares.
- **Controller**: maneja req/res y delega los errores con `next(err)`.
- **Service**: acá vive la lógica de negocio y se lanzan los errores del dominio.
- **Repository**: es el único lugar donde se consulta MongoDB (a través de los models).
- Los errores terminan siempre en el middleware global, que responde con el mismo formato JSON.

Estructura de carpetas:

```txt
src/
  app.js            # Express: middlewares, rutas y swagger
  server.js         # arranca el servidor y conecta a MongoDB
  config/           # env.js (variables de entorno) y db.js (conexión)
  constants/        # estados de pedido, prioridades, roles, tipos de documento
  controller/       # capa HTTP
  service/          # lógica de negocio
  repositories/     # acceso a datos
  models/           # esquemas de Mongoose
  routes/           # definición de rutas
  middlewares/      # manejo de errores, 404 y subida de archivos
  mocks/            # generadores de datos simulados
  docs/             # documentación de Swagger (yaml)
  utils/            # logger, respuestas y diccionario de errores
tests/              # tests funcionales
uploads/            # archivos subidos (no se versiona)
logs/               # logs generados (no se versiona)
```

## Requisitos

- Node.js 22 o superior
- MongoDB (local, con Docker o en Atlas)
- Docker y Docker Compose (opcional, para levantar todo junto)

## Instalación

```bash
git clone https://github.com/Maximiliano-Fallini/shipnow-api.git
cd shipnow-api
npm install
```

Después hay que crear el archivo de variables de entorno a partir del ejemplo:

```bash
cp .env.example .env      # Linux / macOS
copy .env.example .env    # Windows
```

## Ejecución local

```bash
npm start      # levanta la API
npm run dev    # lo mismo pero con nodemon
```

- API: http://localhost:8080
- Health check: http://localhost:8080/health
- Documentación: http://localhost:8080/api/docs

## Variables de entorno

Están centralizadas en `src/config/env.js` y el `.env.example` tiene todas las que se usan:

| Variable | Para qué sirve | Default |
| --- | --- | --- |
| PORT | puerto del servidor | 8080 |
| NODE_ENV | development / production / test | development |
| MONGODB_URI | conexión a MongoDB (incluye el nombre de la base) | mongodb://localhost:27017/shipnow |
| LOG_LEVEL | nivel de Winston (error, warn, info, http, debug) | info |
| UPLOAD_DIR | carpeta donde se guardan los archivos | uploads/documents |
| MAX_FILE_SIZE_MB | tamaño máximo permitido por archivo | 80 |

## Tests

```bash
npm test
```

Los tests usan Mocha + Chai + Supertest y una base aparte llamada `shipnow_test` (se puede cambiar con la variable `TEST_MONGODB_URI`). Cada suite limpia la base antes y después, así que no toca los datos de desarrollo. Cubren los endpoints principales, los casos de error, los mocks, el health check, Swagger y la subida de archivos.

## Documentación de la API

Swagger está en `/api/docs` e incluye los schemas de Usuario, Comercio, Pedido, Documento y Error, además de las respuestas de error de cada endpoint.

## Docker

### Con docker-compose

Levanta la API y MongoDB. La base tiene un healthcheck, así que la API no arranca hasta que Mongo esté respondiendo:

```bash
docker compose up -d --build    # construye la imagen y levanta los servicios
docker compose ps               # ver el estado
docker compose logs -f api      # logs de la API
docker compose down             # baja todo (los datos de Mongo quedan)
docker compose down -v          # baja todo y borra los datos de Mongo
```

Los servicios son `api` (build local, puerto 8080) y `mongo` (imagen `mongo:8`).

### Construir la imagen y correr el contenedor a mano

```bash
docker build -t shipnow-api .
docker network create shipnow-net
docker run -d --name shipnow-mongo --network shipnow-net mongo:8
docker run -d --name shipnow-api --network shipnow-net -p 8081:8080 \
  --env-file .env \
  -e MONGODB_URI=mongodb://shipnow-mongo:27017/shipnow \
  shipnow-api
```

Un detalle importante: si la API corre dentro de un contenedor, `localhost` es el propio contenedor, así que `MONGODB_URI` tiene que apuntar al servicio `mongo` y no a localhost.

La imagen es multi-stage (primero instala las dependencias de producción y después copia solo lo necesario), corre con el usuario `node` y tiene un HEALTHCHECK contra `/health`.

## Logs

Winston escribe en `logs/error.log` (solo errores) y `logs/combined.log` (todo). La salida por consola está activa solamente cuando `NODE_ENV` no es `production`. Para probar los niveles hay un `GET /api/logger`, que existe solo fuera de producción. La carpeta `logs/` está en `.gitignore`.

## Archivos subidos

Se guardan en `uploads/documents` (se puede cambiar con `UPLOAD_DIR`) y los metadatos quedan en MongoDB. Solo se aceptan PDFs de hasta 80 MB. La carpeta `uploads/` está ignorada por git y conviene entregarla vacía.

- Documentos de usuario: `POST /api/users/:uid/documents` (campo `document`, con `type=user_document`)
- Comprobantes de pedido: `POST /api/orders/:oid/proof` (campo `proof`)

## Endpoints principales

**Usuarios**

- `GET /api/users` – listar
- `POST /api/users` – crear
- `GET /api/users/:uid` – obtener por id
- `PUT /api/users/:uid` – actualizar
- `DELETE /api/users/:uid` – eliminar
- `POST /api/users/:uid/documents` – subir documento

**Comercios**

- `GET /api/stores` – listar
- `POST /api/stores` – crear
- `GET /api/stores/:sid` – obtener por id
- `PUT /api/stores/:sid` – actualizar
- `DELETE /api/stores/:sid` – eliminar

**Pedidos (envíos)**

- `GET /api/orders` – listar
- `POST /api/orders` – crear (calcula el total y arranca en `created`)
- `GET /api/orders/:oid` – obtener por id
- `GET /api/orders/:oid/status` – estado actual (tracking)
- `PUT /api/orders/:oid/status` – actualizar estado
- `POST /api/orders/:oid/proof` – subir comprobante de entrega
- `DELETE /api/orders/:oid` – eliminar

**Otros**

- `GET /health` – health check
- `GET /api/docs` – documentación
- `GET /api/logger` – logs de prueba (solo fuera de producción)

Los estados posibles de un pedido son `created`, `assigned`, `picked_up`, `in_transit`, `delivered` y `cancelled`. La referencia completa está en `/api/docs`.

## Módulo de mocks

Genera datos simulados con faker, respetando los modelos y las constantes del proyecto. Solo está disponible fuera de producción.

- `GET /api/mocks/mockingusers?count=10` – usuarios simulados (no los guarda)
- `GET /api/mocks/mockingorders?count=10` – pedidos simulados (no los guarda)
- `POST /api/mocks/createMockUser` – crea un usuario mock
- `POST /api/mocks/createMockUsers` – crea N usuarios mock
- `POST /api/mocks/createMockCustomers` – crea N clientes mock
- `POST /api/mocks/createMockOwners` – crea propietarios y sus comercios
- `POST /api/mocks/createMockOrders` – crea pedidos mock (pide `customerId` y `storeId`)
- `POST /api/mocks/generateData` – genera usuarios, comercios y pedidos de una vez

El `count` acepta valores entre 0 y 100.

## Manejo de errores

Todas las respuestas de error salen con el mismo formato:

```json
{
  "status": "error",
  "error": "USER_NOT_FOUND",
  "message": "Usuario no encontrado"
}
```

Los códigos del dominio son `VALIDATION_ERROR`, `INVALID_STATUS`, `INVALID_MOCK_QUANTITY`, `FILE_REQUIRED`, `INVALID_FILE_TYPE`, `INVALID_DOCUMENT_TYPE`, `INVALID_TOO_LARGE`, `USER_NOT_FOUND`, `STORE_NOT_FOUND`, `ORDER_NOT_FOUND`, `ROUTE_NOT_FOUND` e `INTERNAL_SERVER_ERROR`. Los errores de Multer y de Mongoose se mapean automáticamente a esos códigos.

## Notas

- Los endpoints de mocks y de logger se desactivan con `NODE_ENV=production`.
- Los listados están limitados a 100 documentos para no devolver respuestas gigantes.
- La entrega de un pedido se representa con el estado del pedido (`/api/orders/:oid/status`) y el comprobante (`proof`).
- Antes de entregar: `uploads/` vacía, sin `.env` real, sin logs ni coverage versionados y `npm test` en verde.
