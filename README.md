# Mesa de Partes Virtual · UGEL

Sistema de gestión documentaria para una UGEL: los ciudadanos/docentes registran
documentos (solicitudes, oficios, quejas, etc.), Mesa de Partes los recibe y deriva
a la oficina correspondiente (**Recursos Humanos como oficina principal**, y luego
Dirección, Administración, Asesoría Jurídica, Planificación, Gestión Pedagógica,
Tesorería, Logística, Escalafón, Secretaría General, etc.), y cada oficina puede
atender, observar, re-derivar o archivar el expediente. Todo con trazabilidad
completa y actualización **en tiempo real** (Supabase Realtime).

Construido con **Next.js 14 + Supabase + Tailwind**, pensado para desplegarse
gratis en **Vercel** con base de datos en **Supabase** y código en **GitHub**.

---

## 1. Funcionalidades incluidas

- **Autenticación** (correo/contraseña) con Supabase Auth.
- **4 roles**: `externo` (ciudadano/docente), `mesa_partes`, `jefe_oficina`, `admin`.
- **Emisión de documentos**: formulario con tipo de documento, oficina destino,
  prioridad, folios, descripción y archivo adjunto (PDF/imagen) subido a Supabase
  Storage.
- **Código de expediente automático** tipo `UGEL-2026-000123`.
- **Bandeja de trámites** por oficina, con filtros por estado y búsqueda, y
  actualización en vivo (Realtime) sin recargar la página.
- **Derivación entre oficinas** con observaciones, y cambios de estado
  (recibido → derivado → en proceso → observado → atendido → archivado).
- **Trazabilidad**: línea de tiempo completa de cada expediente.
- **Consulta pública** del estado de un expediente por código, sin necesidad de
  iniciar sesión (`/consulta`).
- **Notificaciones** en tiempo real (campana) cuando un expediente cambia de
  estado o es derivado a tu oficina.
- **Panel de administración**: gestión de oficinas (crear/activar/desactivar) y
  de usuarios (asignar rol y oficina).
- **Reportes**: expedientes por estado y por oficina.
- Seguridad a nivel de base de datos con **Row Level Security (RLS)**: cada
  usuario solo ve lo que le corresponde según su rol.

---

## 2. Requisitos

- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [GitHub](https://github.com)
- Cuenta gratuita en [Vercel](https://vercel.com)
- Node.js 18+ instalado en tu computadora (solo si quieres probarlo localmente)

---

## 3. Paso 1: Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Elige un nombre (ej. `mesa-partes-ugel`), una contraseña de base de datos
   (guárdala) y la región más cercana (ej. South America).
3. Espera 1-2 minutos a que se aprovisione el proyecto.
4. Ve a **SQL Editor** (menú izquierdo) → **New query**.
5. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** su
   contenido, pégalo en el editor y presiona **Run**.
   - Esto crea todas las tablas, funciones, triggers, políticas de seguridad
     (RLS), el bucket de almacenamiento para archivos y las oficinas iniciales
     de la UGEL (con Recursos Humanos como oficina principal).
6. Ve a **Authentication → Providers** y confirma que "Email" esté habilitado
   (viene activado por defecto).
7. (Opcional, recomendado mientras pruebas) En **Authentication → Settings**,
   desactiva "Confirm email" para no depender de la configuración de correo
   saliente mientras haces pruebas. Actívalo de nuevo cuando pases a producción
   real (y configura tu propio proveedor SMTP en **Authentication → SMTP Settings**).
8. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

Estos dos valores son los que usarás en las variables de entorno.

---

## 4. Paso 2: Subir el proyecto a GitHub

1. Crea un repositorio nuevo y vacío en GitHub (por ejemplo `mesa-partes-ugel`).
2. Desde la carpeta de este proyecto en tu computadora:

```bash
git init
git add .
git commit -m "Sistema de Mesa de Partes Virtual - UGEL"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mesa-partes-ugel.git
git push -u origin main
```

---

## 5. Paso 3: Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importa el repositorio de GitHub que acabas de crear.
3. En **Environment Variables**, agrega:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | el `Project URL` de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | el `anon public key` de Supabase |
   | `NEXT_PUBLIC_NOMBRE_UGEL` | ej. `UGEL Chiclayo` (el nombre que quieras mostrar) |

4. Presiona **Deploy**. En 1-2 minutos tendrás tu sistema en línea con una URL
   tipo `https://mesa-partes-ugel.vercel.app`.

Cada vez que hagas `git push` a `main`, Vercel vuelve a desplegar automáticamente.

---

## 6. Paso 4: Configurar el personal de la UGEL

Por defecto, **todo usuario que se registra queda como `externo`** (ciudadano/docente).
Para que el personal de la UGEL pueda usar la bandeja de trámites, deriva y
atienda documentos, sigue este orden:

1. Registra una cuenta normal desde `/registro` con tu correo (será tu cuenta
   de administrador).
2. En Supabase, ve a **SQL Editor** y ejecuta (reemplazando el correo):

   ```sql
   update public.perfiles
   set rol = 'admin'
   where email = 'tu-correo@ejemplo.com';
   ```

3. Vuelve a iniciar sesión en el sistema. Ahora verás el menú **Usuarios** y
   **Oficinas** en el panel.
4. Desde **Usuarios**, pide a cada trabajador que se registre una vez (o
   créales la cuenta tú mismo desde Supabase → Authentication → Add user), y
   luego asígnales:
   - **Rol**: `mesa_partes` (recepciona y deriva todo lo que entra) o
     `jefe_oficina` (solo ve/atiende lo derivado a su oficina).
   - **Oficina**: la oficina a la que pertenece (ej. Recursos Humanos).

Con eso el flujo queda así: un ciudadano envía un documento → cae en la bandeja
de **Mesa de Partes** → el personal de Mesa de Partes lo deriva a la oficina
correspondiente (ej. **Recursos Humanos**) → el jefe de esa oficina lo atiende,
lo observa o lo deriva a otra oficina → se archiva.

---

## 7. Probar localmente (opcional)

```bash
npm install
cp .env.example .env.local   # y completa tus datos de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 8. Estructura del proyecto

```
app/
  page.js                    → Landing pública
  login/, registro/          → Autenticación
  consulta/                  → Seguimiento público de expediente (sin login)
  dashboard/
    layout.js                → Sidebar + topbar (según rol)
    page.js                  → Inicio del panel (resumen)
    nuevo-documento/         → Emitir documento (usuario externo)
    mis-documentos/          → Historial del usuario externo
    bandeja/                 → Bandeja de trámites (personal UGEL)
    documento/[id]/          → Detalle, trazabilidad, derivar, cambiar estado
    oficinas/                → Administración de oficinas (admin)
    usuarios/                → Administración de usuarios (admin)
    reportes/                → Estadísticas
components/                  → Piezas de UI reutilizables
lib/                         → Clientes de Supabase y constantes
supabase/schema.sql          → Esquema completo de base de datos + RLS
middleware.js                → Protección de rutas /dashboard
```

---

## 9. Notas de seguridad

- Todas las tablas tienen **RLS activado**: un usuario externo solo puede leer
  sus propios documentos; un `jefe_oficina` solo ve los expedientes derivados a
  su oficina; `mesa_partes` y `admin` ven todo.
- Las acciones sensibles (derivar, cambiar estado) pasan por funciones SQL
  (`derivar_documento`, `cambiar_estado_documento`) que validan el rol y la
  oficina del usuario en el servidor, no solo en la interfaz.
- La `anon key` de Supabase es pública por diseño (se usa en el navegador); la
  seguridad real la da RLS, no el secreto de esa key.

---

## 10. Posibles mejoras futuras

- Envío de notificaciones también por correo (Supabase Edge Functions + un
  proveedor SMTP o Resend).
- Firma digital / mesa de partes con validación de identidad (RENIEC).
- Exportar reportes a Excel/PDF.
- App móvil o PWA para notificaciones push.
