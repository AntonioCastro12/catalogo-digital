# Conexión de Supabase

La tienda funciona localmente mientras no exista `.env.local`. Al agregar las
variables de Supabase, el catálogo, el administrador y las fotografías pasan a
usar almacenamiento compartido en la nube.

1. Crea o selecciona un proyecto en Supabase.
2. Ejecuta `supabase/setup.sql` desde **SQL Editor**.
3. En **Authentication > Users**, crea la cuenta de Fernanda con correo y contraseña.
4. En **SQL Editor**, autoriza esa cuenta ejecutando:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'correo-de-fernanda@ejemplo.com';
   ```

5. Copia `.env.example` como `.env.local` y completa la URL y la clave
   publicable del proyecto. La clave publicable se puede usar en el navegador;
   nunca coloques una `service_role` o secret key en este archivo.
6. Reinicia `npm run dev`.

En Netlify agrega las mismas variables en **Site configuration > Environment
variables** y vuelve a publicar el sitio.
