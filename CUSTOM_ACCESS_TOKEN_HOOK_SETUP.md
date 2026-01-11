# 🔐 Custom Access Token Hook - Guía de Configuración

## ⚠️ CRÍTICO: Sin esto, el sistema no funcionará correctamente

El Custom Access Token Hook es **esencial** para que las RLS policies funcionen de manera óptima. Sin él:
- ❌ Las queries serán **99.94% más lentas**
- ❌ Los roles y organizaciones no se filtrarán correctamente
- ❌ Los usuarios podrán ver datos de otras organizaciones

## 📋 Prerequisitos

- Acceso al Supabase Dashboard
- Proyecto: `braulioisaiasbernalpadron@gmail.com's Project`
- La función `custom_access_token_hook` ya está creada en la base de datos ✅

## 🎯 Pasos para Activar

### 1. Acceder al Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona el proyecto `braulioisaiasbernalpadron@gmail.com's Project`
3. Ve a la sección **Authentication** en el menú lateral izquierdo

### 2. Configurar el Hook

1. En Authentication, busca la pestaña **Hooks** 
2. Haz clic en **Custom Access Token**
3. Llena los campos de la siguiente manera:

   ```
   Hook Type: ⚙️ Postgres
   Postgres Schema: public
   Postgres function: custom_access_token_hook
   ```

4. Haz clic en **"Create hook"** o **"Enable hook"**

### 3. Verificar la Configuración

Para verificar que el hook está funcionando:

1. Abre el **SQL Editor** en Supabase Dashboard
2. Ejecuta esta query:

```sql
-- Ver la configuración del hook
SELECT * FROM auth.hooks 
WHERE hook_name = 'custom_access_token';
```

Deberías ver algo como:
```json
{
  "id": "...",
  "hook_name": "custom_access_token",
  "hook_table_id": null,
  "hook_table_name": null,
  "created_at": "...",
  "request_id": null
}
```

### 4. Probar que Funciona

1. Inicia sesión en la aplicación
2. Abre las DevTools del navegador
3. Ve a Application > Cookies o Session Storage
4. Copia el access_token
5. Decodifica el JWT en https://jwt.io
6. Verifica que contiene los claims:

```json
{
  "user_role": "admin",
  "org_id": "uuid-de-la-organizacion",
  // ... otros claims estándar
}
```

## 🔄 Actualización del Token

**⚠️ IMPORTANTE**: El JWT tiene una vida útil de **1 hora por defecto**.

Esto significa que si cambias el rol de un usuario, el cambio NO será visible hasta que:
- El token se refresque automáticamente (1 hora)
- El usuario cierre sesión y vuelva a iniciar sesión
- La aplicación fuerce un refresh con `supabase.auth.refreshSession()`

### Estrategias de Mitigación

1. **Force Refresh (Recomendado)**:
   ```typescript
   // Después de cambiar el rol
   await supabase.auth.refreshSession()
   ```

2. **Logout/Login**:
   ```typescript
   // Para cambios críticos (suspender cuenta)
   await supabase.auth.signOut()
   router.push('/login')
   ```

3. **UI Warning**:
   ```tsx
   <Alert>
     Los cambios de rol pueden tardar hasta 1 hora en aplicarse.
     Para aplicarlos inmediatamente, cierra sesión y vuelve a iniciar sesión.
   </Alert>
   ```

## 📊 Impacto en Performance

### Sin Custom Claims (LENTO):
```sql
-- Esta policy tiene que hacer JOIN en cada query
CREATE POLICY "slow" ON clients USING (
  user_id IN (
    SELECT user_id FROM profiles 
    WHERE id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);
-- ⏱️ Tiempo: ~11,000ms con 1000 clientes
```

### Con Custom Claims (RÁPIDO):
```sql
-- Esta policy lee directamente del JWT
CREATE POLICY "fast" ON clients USING (
  organization_id::text = (auth.jwt() ->> 'org_id')
);
-- ⚡ Tiempo: <7ms (99.94% más rápido)
```

## 🐛 Troubleshooting

### El hook no aparece en el dropdown

**Solución**: La función debe estar en el schema `public` y tener la firma correcta:

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
-- ... código
$$;
```

### Los claims no aparecen en el JWT

1. Verifica que el hook está habilitado
2. Cierra sesión y vuelve a iniciar sesión
3. Verifica que la función no tiene errores:

```sql
-- Probar la función directamente
SELECT custom_access_token_hook('{"user_id": "tu-user-id"}'::jsonb);
```

### Error "function does not exist"

Dale permisos a `supabase_auth_admin`:

```sql
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
```

## ✅ Checklist Final

- [ ] Hook creado en Supabase Dashboard
- [ ] Tipo: Postgres
- [ ] Schema: public
- [ ] Function: custom_access_token_hook
- [ ] Hook habilitado
- [ ] JWT contiene `user_role` y `org_id` después de login
- [ ] RLS policies funcionando correctamente
- [ ] Performance mejorado (queries <10ms)

## 📚 Referencias

- [Supabase Docs - Custom Claims](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [RLS Performance Recommendations](https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations)
- [Auth Hooks Documentation](https://supabase.com/docs/guides/auth/auth-hooks)

---

**Estado actual**: ✅ Función creada | ⏳ Esperando activación en Dashboard
