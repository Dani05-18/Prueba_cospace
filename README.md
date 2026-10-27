# CoSpace — Plataforma Fullstack de Reserva de Espacios de Coworking

CoSpace es una plataforma web fullstack construida con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** y **Prisma ORM** con base de datos **PostgreSQL en Supabase**. Permite a los usuarios explorar espacios de trabajo (escritorios, salas de juntas y cabinas acústicas), reservarlos por horas bajo reglas de negocio estrictas, y a los administradores gestionar el catálogo de espacios.

---

## 1. Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de contar con lo siguiente instalado en tu entorno local:

- **Node.js**: Versión `v20.x` o superior (se recomienda `v22.x` o `v26.x`).
- **Gestor de paquetes**: `npm` (incluido con Node.js).
- **Docker y Docker Compose** (opcional, para ejecución contenerizada): Versión 24+.
- **Cuenta en Supabase**: Proyecto activo con base de datos PostgreSQL.
- **Git**: Para el control de versiones.

---

## 2. Variables de Entorno

Copia el archivo de plantilla `.env.example` para crear tu `.env` local:

```bash
cp .env.example .env
```

A continuación se detalla cada variable, su propósito y cómo obtenerla:

| Variable | Propósito | Cómo obtenerla / Valor de ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión al pooler de PostgreSQL en Supabase (Modo Transaction/Session, puerto 6543 o 5432). | En Supabase: *Project Settings* → *Database* → *Connection string* (URI). Reemplaza `[YOUR-PASSWORD]` por la contraseña de la base de datos. |
| `DIRECT_URL` | Conexión directa a PostgreSQL (puerto 5432) usada por Prisma para ejecutar migraciones sin pasar por el pooler. | En Supabase: *Project Settings* → *Database* → *Connection string* (Direct connection). |
| `JWT_ACCESS_SECRET` | Clave secreta simétrica para firmar los Access Tokens (duración 15 minutos). | Generar un hash criptográfico de 32+ caracteres. Ejemplo en terminal: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Clave secreta simétrica para firmar los Refresh Tokens (duración 7 días). | Generar otro hash independiente: `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRES_IN` | Tiempo de vida del Access Token. | Valor por defecto: `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Tiempo de vida del Refresh Token. | Valor por defecto: `7d` |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación. | En desarrollo: `http://localhost:3000` (o `http://localhost:3001`). En producción: la URL asignada por Vercel. |

---

## 3. Ejecución en Desarrollo (Paso a Paso)

Sigue estos comandos en orden estricto para levantar el proyecto desde cero:

### Paso 1: Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd cospace
npm install
```

### Paso 2: Configurar las variables de entorno
Crea el archivo `.env` a partir de `.env.example` y rellena las credenciales de Supabase y los secretos JWT:
```bash
cp .env.example .env
```

### Paso 3: Aplicar migraciones de la base de datos
Genera el cliente de Prisma y corre las migraciones hacia Supabase:
```bash
npx prisma generate
npm run db:deploy
# O si estás creando nuevas migraciones:
# npm run db:migrate
```

### Paso 4: Poblar la base de datos (Seed inicial)
Ejecuta el script que crea el usuario Administrador y los espacios de prueba iniciales:
```bash
npm run db:seed
```

### Paso 5: Iniciar el servidor de desarrollo
```bash
npm run dev
# O en un puerto específico si el 3000 está ocupado:
# npm run dev -- -p 3001
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000) (o el puerto indicado).

---

## 4. Credenciales de Prueba (Seed)

El script de inicialización (`prisma/seed.ts`) crea automáticamente la siguiente cuenta de Administrador:

- **Rol**: Administrador (`ADMIN`)
- **Email**: `admin@cospace.com`
- **Contraseña**: `Admin123!`

> Para probar el rol de usuario normal (`USER`), utiliza el formulario público de registro en `/register`.

---

## 5. Ejecución con Docker

El proyecto cuenta con un `Dockerfile` optimizado en múltiples etapas (*multi-stage build*) y soporte para `docker-compose`.

### Opción A: Con Docker Compose (Recomendada)
Asegúrate de que tu `.env` tenga las variables requeridas y ejecuta:
```bash
docker compose up --build
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Opción B: Con Docker CLI
```bash
# 1. Construir la imagen
docker build -t cospace-app .

# 2. Correr el contenedor pasando las variables de entorno
docker run -p 3000:3000 --env-file .env cospace-app
```

---

## 6. Scripts Disponibles en `package.json`

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Next.js y Turbopack. |
| `npm run build` | Compila la aplicación para producción (verifica TypeScript y compila rutas SSG/SSR). |
| `npm run start` | Inicia el servidor de producción generado por el build. |
| `npm run lint` | Ejecuta ESLint sobre el código fuente asegurando calidad y tipado. |
| `npm test` | Ejecuta la suite de pruebas unitarias con **Vitest** (`rules.test.ts`). |
| `npm run db:deploy` | Aplica las migraciones pendientes en la base de datos de producción (`prisma migrate deploy`). |
| `npm run db:seed` | Ejecuta el script de semilla `prisma/seed.ts`. |
| `npm run db:studio` | Abre la interfaz visual de Prisma Studio para inspeccionar registros en la base de datos. |

---

## 7. Estructura del Proyecto

```text
cospace/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de integración continua (Lint, Test, Build)
├── prisma/
│   ├── schema.prisma            # Modelado de datos (User, Space, Booking, RefreshToken)
│   ├── seed.ts                  # Seed con cuenta de Administrador y espacios iniciales
│   └── migrations/              # Historial de migraciones SQL
├── src/
│   ├── app/
│   │   ├── (admin)/             # Route Group del Panel de Administración (/admin)
│   │   ├── (auth)/              # Route Group centrado para Login y Registro (/login, /register)
│   │   ├── (private)/           # Route Group protegido para el Usuario (/dashboard)
│   │   ├── (public)/            # Route Group público (/ espacios, detalle de espacio)
│   │   ├── api/                 # Route Handlers (/api/auth, /api/spaces, /api/bookings)
│   │   ├── layout.tsx           # Root layout general con Providers
│   │   └── globals.css          # Estilos globales y Tailwind CSS v4
│   ├── components/
│   │   ├── home/                # Componentes de Landing Page (Hero, Features)
│   │   ├── spaces/              # Componentes de Catálogo, SpaceCard, BookingForm
│   │   └── shared/              # Navbar, Footer, Providers, ClientClock, Selector de Idioma
│   ├── lib/
│   │   ├── auth.ts              # Utilidades JWT, hashing SHA-256 y gestión de cookies seguras
│   │   ├── api-response.ts      # Manejo centralizado de respuestas y errores HTTP (400, 401, 403, 404, 409)
│   │   ├── prisma.ts            # Cliente Singleton de Prisma ORM
│   │   ├── i18n/                # Diccionario de traducciones (Español / Inglés) y Contexto
│   │   └── bookings/
│   │       ├── rules.ts         # Reglas puras de negocio (horarios, duraciones, solapamientos, límites)
│   │       └── rules.test.ts    # 20 pruebas unitarias con Vitest (100% de cobertura de reglas)
│   └── proxy.ts                 # Proxy de seguridad de Next.js 16 para protección de rutas y renovación de tokens
├── Dockerfile                   # Dockerfile multi-stage de producción
├── docker-compose.yml           # Configuración de Docker Compose
└── README.md                    # Guía técnica de despliegue y sustentación
```

---

## 8. Reglas de Negocio Implementadas

1. **Duración estricta**: Reservas entre 1 y 4 horas enteras (minutos en `:00`).
2. **Ventana horaria**: Solo reservas entre las 7:00 AM y 9:00 PM hora oficial de Bogotá (`America/Bogota`, UTC-5).
3. **Anticipación**: No reservas en el pasado ni con más de 30 días en el futuro.
4. **No solapamiento**: Validación matemática de intervalos `[start, end)`. Reservas continuas (ej. 12:00-14:00 y 14:00-16:00) sí están permitidas.
5. **Solapamiento por usuario**: Un mismo usuario no puede tener reservas simultáneas en espacios distintos.
6. **Límite de reservas**: Máximo 3 reservas futuras confirmadas por usuario.
7. **Cálculo de precio en servidor**: Horas calculadas $\times$ precio por hora del espacio en backend; nunca se confía en el cliente.
8. **Cancelación segura**: Exclusiva para el dueño o administrador; usuarios solo pueden cancelar hasta 2 horas antes del inicio.
9. **Desactivación de espacios**: Los espacios no se borran físicamente, se desactivan (`isActive: false`). Si tienen reservas futuras confirmadas, el backend rechaza la acción con código **409 Conflict**.
10. **Concurrencia**: Transacciones con nivel de aislamiento `Serializable` en Prisma para prevenir condiciones de carrera al reservar.

---

## 9. URL de la Aplicación Desplegada

- **Producción (Vercel)**: `https://cospace-daniella.vercel.app` *(Actualizar tras desplegar el repositorio)*
- **Base de Datos**: PostgreSQL en Supabase (AWS us-east-1)
