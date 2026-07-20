# Rumbo a Ingeniería v2.0.0 — Núcleo Nube

Primera entrega de la reconstrucción profesional. Funciona desde el primer momento en **modo demostración** y contiene la base para conectarse a Supabase.

## Accesos demo
- Administrador: 2607
- Profesor: 5832
- Alumno: 1001
- Padre/tutor: 7001

## Probar desde un celular
1. Descomprime la carpeta en GitHub Codespaces, Replit o un servidor web.
2. Sirve el proyecto por HTTPS o localhost.
3. Abre `index.html` mediante el servidor. La app puede instalarse como PWA.

## Probar en una computadora
```bash
python -m http.server 8000
```
Abre `http://localhost:8000`.

## Conectar la nube
1. Crea un proyecto gratuito en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Crea los usuarios en Supabase Auth.
4. Completa `app/config.js` y cambia `mode` de `demo` a `cloud`.
5. Crea buckets privados para tareas y biblioteca.
6. Despliega `supabase/functions/atenea` y guarda `OPENAI_API_KEY` como secreto.

## Incluido en esta fase
- Aplicación única por roles.
- Sesiones y permisos en modo demo.
- Paneles adaptables a teléfono, tableta y computadora.
- Usuarios, cursos, clases, tareas, biblioteca, mensajes, pagos y progreso.
- Atenea local y función segura preparada para IA real.
- PWA instalable y caché sin conexión.
- Esquema PostgreSQL completo con políticas RLS iniciales.
- Respaldo JSON.

## Importante
La sincronización real entre dispositivos se activa al conectar Supabase. El ZIP no contiene contraseñas, claves privadas ni credenciales del usuario.
