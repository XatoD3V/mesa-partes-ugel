-- ============================================================
-- MIGRACIÓN: guardar DNI y teléfono correctamente al registrarse
-- Pega y ejecuta esto en Supabase → SQL Editor
-- ============================================================

create or replace function public.fn_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombres, apellidos, email, numero_documento, telefono, tipo_documento, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombres', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'apellidos', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'numero_documento', ''),
    nullif(new.raw_user_meta_data->>'telefono', ''),
    coalesce(nullif(new.raw_user_meta_data->>'tipo_documento', ''), 'DNI'),
    'externo'
  )
  on conflict (id) do update set
    numero_documento = coalesce(public.perfiles.numero_documento, excluded.numero_documento),
    telefono = coalesce(public.perfiles.telefono, excluded.telefono);
  return new;
end;
$$;

-- Nota: esto solo corrige el guardado de las cuentas NUEVAS que se registren
-- de aquí en adelante. Los registros que ya existen y salen con "—" en DNI/Teléfono
-- (porque nunca se guardaron) no se pueden recuperar automáticamente: hay que
-- pedirle el dato al usuario y completarlo a mano desde "Usuarios" o "Historial de registros".
