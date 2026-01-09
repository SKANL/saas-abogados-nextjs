# 🏛️ Supabase Backend Integration Guide

Este documento describe la arquitectura del backend y cómo integrar los componentes con Supabase.

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── supabase/           # Clientes de Supabase
│   │   ├── client.ts       # Cliente para navegador (CSR)
│   │   ├── server.ts       # Cliente para servidor (SSR)
│   │   ├── middleware.ts   # Middleware de sesión
│   │   ├── database.types.ts # Tipos TypeScript
│   │   └── index.ts        # Exports centralizados
│   │
│   └── services/           # Servicios de datos (Repository Pattern)
│       ├── types.ts        # Interfaces de servicios
│       ├── auth.service.ts
│       ├── profile.service.ts
│       ├── clients.service.ts
│       ├── templates.service.ts
│       ├── portal.service.ts
│       ├── documents.service.ts
│       ├── answers.service.ts
│       └── index.ts        # Exports centralizados
│
├── hooks/                  # React Hooks
│   ├── use-auth.ts
│   ├── use-clients.ts
│   ├── use-templates.ts
│   ├── use-profile.ts
│   ├── use-portal.ts
│   ├── use-realtime.ts
│   └── index.ts
│
└── middleware.ts           # Next.js middleware
```

## 🚀 Setup Rápido

### 1. Configurar Variables de Entorno

Edita `.env.local` y agrega tus keys de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Ejecutar el Schema SQL

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Pega el contenido de `supabase-schema.sql`
5. Ejecuta el script

### 3. Crear el Storage Bucket

El schema ya crea el bucket, pero verifica en **Storage**:

- Bucket: `firm-assets`
- Público: Sí (para URLs de contratos/logos)

## 🔧 Uso en Componentes

### Client Components (CSR)

```tsx
'use client'

import { useClients, useAuth } from '@/hooks'

export function ClientsList() {
  const { clients, loading, create, remove } = useClients()
  const { user, signOut } = useAuth()

  if (loading) return <Loading />

  return (
    <div>
      <p>Bienvenido, {user?.email}</p>
      <button onClick={signOut}>Cerrar sesión</button>
      
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {client.client_name}
            <button onClick={() => remove(client.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Server Components (SSR)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Usuario: {user?.email}</p>
      <ClientsList initialData={clients} />
    </div>
  )
}
```

### Server Actions

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('clients').insert({
    client_name: formData.get('name') as string,
    case_name: formData.get('case') as string,
    contract_template_id: formData.get('contract') as string,
    questionnaire_template_id: formData.get('questionnaire') as string,
  })

  if (error) throw error

  revalidatePath('/dashboard/clients')
}
```

### API Routes

```tsx
// app/api/clients/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

## 🎯 Arquitectura Desacoplada

La arquitectura sigue el **Repository Pattern** para desacoplar la lógica de negocio del proveedor de datos:

```
┌─────────────────┐
│   Components    │  ← React Components (UI)
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│     Hooks       │  ← React Hooks (State Management)
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│   Services      │  ← Business Logic (Repository Pattern)
└────────┬────────┘
         │ implements
         ▼
┌─────────────────┐
│   Supabase      │  ← Data Provider (Can be swapped)
└─────────────────┘
```

### Cambiar el Proveedor de Datos

Para usar otro backend (REST API, GraphQL, etc.), solo necesitas:

1. Crear nuevas implementaciones de los servicios en `lib/services/`
2. Mantener las mismas interfaces (`IClientsService`, `IAuthService`, etc.)
3. Los hooks y componentes funcionarán sin cambios

```typescript
// Ejemplo: Cambiar a REST API
import type { IClientsService } from './types'

export const clientsServiceRest: IClientsService = {
  async list(options) {
    const res = await fetch('/api/clients?' + new URLSearchParams(options))
    return res.json()
  },
  // ... otros métodos
}
```

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas principales:

| Tabla | Política |
|-------|----------|
| `profiles` | Solo el usuario dueño puede ver/editar |
| `clients` | Solo el usuario dueño puede ver/editar (soft delete) |
| `contract_templates` | Solo el usuario dueño puede ver/eliminar |
| `client_documents` | Portal público puede subir con link válido |
| `audit_logs` | Inserción libre, lectura restringida |

### Magic Links

Los magic links del portal cliente:

- Expiran después de 72 horas (configurable)
- Son revocables en cualquier momento
- Trackean accesos y conteo de uso
- Solo permiten operaciones en clientes `pending`

## ⚡ Real-time

Para actualizaciones en tiempo real:

```tsx
'use client'

import { useRealtimeClients } from '@/hooks/use-realtime'

export function LiveClientsList() {
  const { clients, loading } = useRealtimeClients()

  return (
    <ul>
      {clients.map(client => (
        <li key={client.id} className="animate-fade-in">
          {client.client_name} - {client.status}
        </li>
      ))}
    </ul>
  )
}
```

## 📊 Tier Gratuito de Supabase

El schema está optimizado para el tier gratuito:

| Recurso | Límite Free | Uso Estimado |
|---------|-------------|--------------|
| Base de datos | 500 MB | ~200 MB (500 clientes/año) |
| Storage | 1 GB | ~500 MB (documentos) |
| Bandwidth | 5 GB/mes | ~2 GB/mes |
| Auth MAU | 50,000 | < 100 |
| Edge Functions | 500K invocaciones | < 10K/mes |

### Recomendaciones para Optimizar

1. **Limpia documentos antiguos** - Configura retención de 1 año
2. **Usa soft deletes** - Marca `deleted_at` en lugar de DELETE
3. **Comprime imágenes** - Máximo 200KB para logos
4. **Pagina listas** - Máximo 20 items por página

## 🧪 Testing

```typescript
// Ejemplo de test con mock
import { clientsService } from '@/lib/services'

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: [{ id: '1', client_name: 'Test' }],
        error: null,
      }),
    }),
  },
}))

test('lista clientes', async () => {
  const result = await clientsService.list()
  expect(result.data).toHaveLength(1)
})
```

## 📝 Checklist de Implementación

- [x] Configurar `.env.local` con keys de Supabase
- [x] Ejecutar `supabase-schema.sql` en el dashboard
- [x] Verificar bucket `firm-assets` en Storage
- [ ] Implementar páginas de autenticación (`/login`, `/register`)
- [ ] Implementar dashboard con lista de clientes
- [ ] Implementar CRUD de plantillas
- [ ] Implementar portal de cliente
- [ ] Configurar emails (opcional, Resend)
- [ ] Configurar dominio personalizado

## 🆘 Troubleshooting

### Error: "Missing environment variables"

Verifica que `.env.local` tenga todas las variables requeridas.

### Error: "Row level security policy violation"

El usuario no tiene permisos. Verifica:

1. Que el usuario esté autenticado
2. Que las RLS policies estén correctas
3. Que el `user_id` coincida

### Error: "relation does not exist"

Ejecuta el schema SQL completo en Supabase SQL Editor.

### Error: "CORS"

En Supabase Dashboard > Settings > API, agrega tu dominio a "Additional allowed origins".

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
