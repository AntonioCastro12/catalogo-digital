# Conexión de Supabase

La tienda funciona localmente mientras no exista `.env.local`. Al agregar las
variables de Supabase, el catálogo, las ventas, el administrador y las
fotografías pasan a usar almacenamiento compartido en la nube.

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

## Dónde se administran las fotos y las ventas

- Fotos: entra a `/admin`, abre **Agregar producto** o **Editar producto** y usa
  la sección **Fotografías**. Cada foto nueva se optimiza y recibe la marca de
  agua `Fernanda Lara` antes de subirse. Las fotos antiguas conservan su versión
  actual hasta que se vuelvan a cargar.
- Ventas: abre **Ventas** en el menú administrativo. Registra los pedidos ya
  confirmados para calcular automáticamente los ingresos de hoy, la semana y el
  año. Un clic en WhatsApp no se cuenta como venta por sí solo.

Si `supabase/setup.sql` ya se había ejecutado antes, vuelve a ejecutar el archivo
completo para crear las tablas y políticas de ventas nuevas.

En Netlify agrega las mismas variables en **Site configuration > Environment
variables** y vuelve a publicar el sitio.

Para publicar solamente una muestra sin Supabase, no agregues esas variables.
El catálogo funcionará con los productos incluidos y los cambios del
administrador se conservarán únicamente en el navegador que los realizó.
