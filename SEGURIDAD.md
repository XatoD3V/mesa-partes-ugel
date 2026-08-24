# Refuerzo de seguridad

Esta versión incorpora:

- Cabeceras HTTP de seguridad.
- Eliminación del encabezado `X-Powered-By`.
- Comprobación centralizada de sesión, estado y rol en APIs administrativas.
- Validación de correo y contraseña al crear usuarios.
- Rollback si la creación del usuario falla al completar su perfil.
- Mensajes de error administrativos sin filtrar detalles internos.
- Control de autorización adicional en el endpoint de notificaciones.

## Variables de entorno

`SUPABASE_SERVICE_ROLE_KEY` debe existir únicamente en variables de entorno del servidor de Vercel. Nunca debe comenzar con `NEXT_PUBLIC_` ni aparecer en el código del navegador.

## Storage

El bucket `documentos` sigue público en esta entrega para no romper los expedientes existentes que actualmente guardan URLs públicas. La migración a bucket privado con URLs firmadas debe hacerse como una segunda etapa, migrando primero `archivo_url` y los adjuntos de `derivaciones`.
