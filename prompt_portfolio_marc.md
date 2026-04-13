# PROMPT — Portfolio Personal con Acceso por Empresa y Analíticas

---

## CONTEXTO DEL PROYECTO

Quiero construir un **portfolio personal profesional** con las siguientes características clave:

- Las empresas acceden mediante **links únicos privados** (no hay login público ni contraseña a escribir). Cada empresa recibe su propio enlace del tipo `https://tudominio.com/v/[token-unico]` generado automáticamente.
- El propietario (yo) tiene un **panel de administración privado** con login propio para gestionar todo el contenido y ver analíticas detalladas.
- El portfolio muestra **empresas para las que he trabajado** y **proyectos personales/freelance** como categoría separada, y dentro de cada uno los **trabajos/proyectos** realizados en formato blog.
- Hay una **página de CV** con visualización web y exportación en PDF, y una **página "Sobre mí"** separada, más personal.
- El sitio está disponible en **4 idiomas**: catalán (por defecto), castellano, inglés y francés.

---

## STACK TECNOLÓGICO RECOMENDADO

- **Framework**: Next.js 14 con App Router
- **Base de datos y Auth**: Supabase (PostgreSQL + autenticación para el admin)
- **Estilos**: Tailwind CSS
- **Editor de texto enriquecido**: TipTap (para los posts de trabajos: headings, bold, italic, citas, imágenes inline, listas)
- **Internacionalización**: next-intl
- **PDF Export del CV**: @react-pdf/renderer (server-side Route Handler)
- **Gráficas de analíticas**: Recharts
- **Notificaciones email**: Resend (notificación al propietario cuando alguien entra)
- **Deploy**: Vercel (free tier suficiente)
- **Almacenamiento de imágenes**: Supabase Storage

---

## SISTEMA DE DISEÑO

### Paleta de colores
```
--color-bg:           #1A1A1A    /* fondo principal gris muy oscuro */
--color-surface:      #242424    /* superficie de cards y paneles */
--color-border:       #2E2E2E    /* bordes sutiles */
--color-text:         #F0EDE8    /* texto principal blanco roto / beige muy claro */
--color-muted:        #888880    /* texto secundario */
--color-accent:       #C41E1E    /* rojo intenso — único color de acento */
--color-accent-hover: #A01818    /* rojo oscurecido para hover */
```

### Tipografía
- **Display / Títulos grandes**: Playfair Display — serif elegante, da carácter
- **Cuerpo y UI**: DM Sans — limpio, moderno, legible
- Escala tipográfica estricta: xs / sm / base / lg / xl / 2xl / 3xl / 4xl

### Principios visuales
- Minimalismo radical: sin elementos decorativos superfluos
- Generoso espacio en blanco
- Líneas finas como separadores (nunca cajas pesadas)
- El rojo aparece solo en elementos interactivos clave: links activos, botones primarios, indicadores de estado, hover en navegación
- Sin gradientes, sin sombras dramáticas — solo profundidad real con capas de color plano
- Iconografía: Lucide Icons (SVG, trazo fino)
- Transiciones suaves: 200ms ease-in-out en todos los elementos interactivos

---

## ARQUITECTURA DE RUTAS

### Vistas públicas (requieren token válido en URL)
```
/v/[token]                    → Página de entrada personalizada del portfolio
/v/[token]/sobre-mi           → Página "Sobre mí" (personal, con foto y valores)
/v/[token]/empresa/[slug]     → Detalle de una empresa con sus trabajos
/v/[token]/freelance          → Listado de proyectos personales y freelance
/v/[token]/trabajo/[slug]     → Detalle de un trabajo (blog post)
/v/[token]/cv                 → Página del CV web
```

### Panel de administración (solo propietario)
```
/admin                        → Login del propietario
/admin/dashboard              → Dashboard con analíticas globales y comparativa entre tokens
/admin/sobre-mi               → Editar página "Sobre mí"
/admin/empresas               → Listado y gestión de empresas
/admin/empresas/nueva         → Crear empresa
/admin/empresas/[id]/editar   → Editar empresa
/admin/trabajos               → Listado de todos los trabajos (con filtros y acciones rápidas)
/admin/trabajos/nuevo         → Crear trabajo
/admin/trabajos/[id]/editar   → Editar trabajo (editor TipTap)
/admin/cv                     → Editar CV
/admin/accesos                → Gestión de tokens de acceso y analíticas por empresa
```

---

## MODELOS DE DATOS (Supabase / PostgreSQL)

### `companies`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
slug          TEXT UNIQUE NOT NULL
name          TEXT NOT NULL
logo_url      TEXT
description   TEXT                   -- breve descripción de la empresa
sector        TEXT
location      TEXT
start_date    DATE
end_date      DATE                   -- NULL si es trabajo actual
website       TEXT
is_freelance  BOOLEAN DEFAULT false  -- true = proyecto personal / freelance
created_at    TIMESTAMPTZ DEFAULT now()
```

### `works`
```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
company_id       UUID REFERENCES companies(id) ON DELETE CASCADE
slug             TEXT UNIQUE NOT NULL
title            TEXT NOT NULL
cover_url        TEXT
summary          TEXT                  -- extracto corto para la card
content          JSONB                 -- contenido TipTap en formato JSON
tags             TEXT[]
work_date        DATE
status           TEXT DEFAULT 'draft'  -- 'draft' | 'published' | 'archived'
featured         BOOLEAN DEFAULT false -- aparece destacado en la portada del portfolio
protected        BOOLEAN DEFAULT false -- requiere PIN adicional (para proyectos NDA)
pin_hash         TEXT                  -- hash bcrypt del PIN de 4 dígitos (si protected=true)
version_history  JSONB DEFAULT '[]'   -- array de snapshots { timestamp, title, content }
created_at       TIMESTAMPTZ DEFAULT now()
updated_at       TIMESTAMPTZ DEFAULT now()
```

### `about_me`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
photo_url   TEXT
tagline     JSONB           -- { ca, es, en, fr }
bio         JSONB           -- { ca, es, en, fr } texto largo y personal
values      JSONB           -- { ca, es, en, fr } lista de valores / forma de trabajar
updated_at  TIMESTAMPTZ DEFAULT now()
```

### `cv_sections`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
type        TEXT NOT NULL   -- 'experiencia' | 'educacion' | 'habilidades' | 'idiomas' | 'sobre_mi'
title       JSONB           -- { ca, es, en, fr }
content     JSONB           -- { ca, es, en, fr } rich text o estructurado
sort_order  INT DEFAULT 0
```

### `access_tokens`
```sql
id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
token            TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex')
label            TEXT NOT NULL          -- nombre descriptivo: "Entrevista Google Mayo 2025"
welcome_message  JSONB                  -- { ca, es, en, fr } mensaje de bienvenida personalizado
company_ids      UUID[]                 -- empresas visibles (NULL = todo el portfolio)
active           BOOLEAN DEFAULT true
expires_at       TIMESTAMPTZ            -- NULL = sin caducidad; default: +60 días desde creación
notify_email     BOOLEAN DEFAULT true   -- enviar email al propietario cuando alguien entra
pin_hash         TEXT                   -- hash bcrypt de PIN opcional (doble capa de seguridad)
created_at       TIMESTAMPTZ DEFAULT now()
```

### `analytics_events`
```sql
id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
token_id     UUID REFERENCES access_tokens(id)
event_type   TEXT NOT NULL
  -- 'view_portfolio' | 'view_about' | 'view_company' | 'view_work'
  -- 'view_cv' | 'download_cv' | 'pin_attempt' | 'pin_success'
resource_id  UUID              -- id de empresa o trabajo (nullable)
page_path    TEXT
referrer     TEXT
duration_sec INT               -- tiempo en página (calculado al salir)
scroll_pct   INT               -- porcentaje máximo de scroll alcanzado (0–100)
created_at   TIMESTAMPTZ DEFAULT now()
```

---

## FUNCIONALIDADES DETALLADAS

### 1. Sistema de tokens de acceso

Desde `/admin/accesos` el admin puede:
- Crear un nuevo token con nombre descriptivo
- Escribir un **mensaje de bienvenida personalizado** (por idioma) que aparece al entrar
- Configurar qué empresas/trabajos son visibles (o "todo el portfolio")
- Establecer fecha de caducidad (por defecto, 60 días desde la creación)
- Añadir un **PIN de 4 dígitos opcional** sobre el link para doble capa de seguridad
- Activar/desactivar el token con un toggle
- Activar/desactivar la notificación por email al entrar
- Copiar el link al portapapeles con un clic
- Ver analíticas detalladas del token

Al acceder a `/v/[token]`:
- Token inexistente, caducado o inactivo → página de error genérica sin pistas
- Token con PIN → pantalla de introducción de PIN antes de mostrar el portfolio
- Token válido → se registra el evento, se envía notificación email (si activo), se muestra el portfolio con el mensaje de bienvenida personalizado


### 2. Notificaciones por email al propietario

- Integrado con **Resend** para emails transaccionales
- Al producirse `view_portfolio` con `notify_email = true`, se envía un email inmediato al propietario con: nombre del token, hora de entrada y link directo a sus analíticas
- Solo se dispara una vez por sesión por token (cookie `notified_[token]` con TTL 1h) para evitar spam en recargas
- Diseño del email minimalista y acorde al estilo del portfolio


### 3. Open Graph personalizado por token

- Cada URL `/v/[token]` genera metadatos Open Graph dinámicos con `generateMetadata()` de Next.js
- `og:title`: "Portfolio de [Nombre] · Para [label del token]"
- `og:description`: tagline profesional
- `og:image`: imagen de portada con foto de perfil + nombre
- Cuando el reclutador comparte el link, la preview es personalizada para esa empresa


### 4. Vista pública del portfolio

**Página de entrada `/v/[token]`**
- Banner sutil con el mensaje de bienvenida personalizado (desaparece al hacer scroll)
- Hero limpio: nombre, cargo/tagline y breve bio
- **Trabajos destacados** (featured = true): 2-3 cards grandes antes del listado de empresas
- Listado de empresas (cards horizontales): logo, nombre, sector, fechas, descripción corta
- Enlace a proyectos personales / freelance

**Página "Sobre mí" `/v/[token]/sobre-mi`**
- Foto de perfil
- Bio extensa y personal (tono humano, diferente al CV formal)
- Sección de valores y forma de trabajar

**Página de empresa `/v/[token]/empresa/[slug]`**
- Cabecera: logo, nombre, sector, ubicación, fechas, web
- Grid de cards de trabajos publicados: cover, título, extracto, fecha, tags, icono de candado si está protegido

**Página de proyectos freelance `/v/[token]/freelance`**
- Misma estructura que la página de empresa pero sin cabecera de compañía
- Muestra todos los trabajos asociados a companies con `is_freelance = true`

**Post de trabajo `/v/[token]/trabajo/[slug]`**
- Si `protected = true` y el PIN no ha sido verificado en sesión → pantalla de PIN
- Portada con imagen de cover, título (Playfair), empresa, fecha, tags
- Contenido TipTap: H1-H3, párrafos, negritas, itálicas, listas, citas, imágenes, separadores, código inline
- Navegación anterior / siguiente trabajo
- Botón flotante **"Modo presentación"**

**Modo presentación** (`?mode=present`)
- Vista limpia sin navbar ni UI: solo título + contenido + imágenes, fondo negro puro
- Ideal para compartir pantalla en reuniones
- Tecla Esc o botón en esquina superior para salir

**Página CV `/v/[token]/cv`**
- CV web por secciones: Sobre mí, Experiencia, Educación, Habilidades, Idiomas
- Cada sección tiene un ID para tracking de scroll (mapa de calor)
- Botón **Descargar PDF** → genera PDF server-side (Playfair para nombre y headings, DM Sans para cuerpo, franja roja fina en cabecera)


### 5. Panel de administración

**Dashboard `/admin/dashboard`**
- Métricas globales: visitas totales, trabajos más vistos, tiempo medio, descargas de CV
- Gráfico de línea: actividad por día (últimos 30 días)
- **Tabla comparativa entre tokens**: páginas vistas, tiempo medio, última visita, side-by-side

**Analíticas por token `/admin/accesos`**
- Lista de todos los tokens con stats resumidos y acceso a detalle
- Al expandir: timeline de eventos, tiempo por página, % de scroll por post, mapa de calor de secciones del CV

**Gestión de trabajos `/admin/trabajos`**
- Tabla con columnas: título, empresa, estado, destacado, protegido, fecha
- Filtros: por empresa, por estado, por tag
- Acciones rápidas: publicar/archivar, marcar como destacado, **duplicar**
- **Duplicar**: crea copia en Borrador con slug `-copia`, mismo contenido, lista para adaptar

**Editor de trabajos**
- TipTap con extensiones: StarterKit, Image, Link, Placeholder, CharacterCount, Underline, Blockquote, HorizontalRule
- Imágenes: drag & drop → Supabase Storage → URL insertada
- Selector de estado: Borrador / Publicado / Archivado
- Toggle de destacado en portada
- Toggle de protegido NDA + campo de PIN (si activo)
- Asociación a empresa o "Freelance / Personal"
- Preview antes de publicar
- **Historial de versiones**: lista de snapshots anteriores con timestamp, restauración con un clic (máximo 20 versiones guardadas)

**Editor de CV**
- Formulario estructurado por secciones con campos multiidioma (ca / es / en / fr)
- Reordenable con drag & drop

**Editor de "Sobre mí"**
- Upload de foto de perfil
- Bio y valores por idioma


### 6. Internacionalización (i18n)

- Idioma por defecto: **catalán** (`ca`)
- Idiomas disponibles: `ca`, `es`, `en`, `fr`
- Selector en esquina superior derecha con códigos (CA / ES / EN / FR)
- Fallback al catalán si no hay traducción para el idioma seleccionado
- Textos de UI completamente traducidos en los 4 idiomas
- La URL no cambia con el idioma — preferencia detectada por navegador y guardada en cookie


### 7. Tracking avanzado de comportamiento

- **Tiempo en página**: timestamp al entrar; duración enviada al salir (`beforeunload` / `visibilitychange`)
- **Porcentaje de scroll**: scroll máximo alcanzado en el post, enviado al salir junto con la duración
- **Mapa de calor del CV**: cada sección tiene un ID; `IntersectionObserver` detecta cuáles han sido vistas y en qué proporción
- Todos los eventos se envían de forma no bloqueante (fire-and-forget, error silencioso)

---

## SEGURIDAD Y PRIVACIDAD

- `/admin` protegido por autenticación Supabase (email + contraseña del propietario)
- `/v/[token]/*` validado en servidor via middleware de Next.js antes de renderizar nada
- Tokens: strings hexadecimales de 24 caracteres generados con `crypto.getRandomValues`
- PINs (tokens y trabajos protegidos): almacenados como hash bcrypt, nunca en texto plano
- Páginas de error completamente genéricas (no revelan si el token existe o no)
- Analíticas sin IPs ni datos personales identificables
- Políticas RLS en Supabase: solo el admin autenticado puede escribir

---

## DETALLES UX IMPORTANTES

- Sin skeleton loaders genéricos: fade-in suave con `opacity` transition
- Sin spinners de carga: Suspense con contenido inmediato
- Cards de empresa: layout horizontal, logo izquierda, borde izquierdo rojo en hover
- Cards de trabajos destacados: más grandes, imagen prominente, badge "Destacat"
- Cards de trabajo: imagen 16:9, título Playfair, extracto DM Sans, tags en pills, icono candado si protegido
- Botones primarios: fondo #C41E1E, texto beige, border-radius 4px
- Links de navegación: beige muted → blanco en hover → subrayado rojo en activo
- Modo presentación: fondo negro puro, tipografía grande, cero UI
- Banner de bienvenida: franja discreta bajo el navbar, cursiva, desaparece al hacer scroll

---

## ESTRUCTURA DE CARPETAS (Next.js App Router)

```
/app
  /[locale]
    /v/[token]
      /page.tsx                     → home (bienvenida + destacados + empresas)
      /sobre-mi/page.tsx
      /empresa/[slug]/page.tsx
      /freelance/page.tsx
      /trabajo/[slug]/page.tsx
      /cv/page.tsx
    /admin
      /page.tsx                     → login
      /dashboard/page.tsx
      /sobre-mi/page.tsx
      /empresas/...
      /trabajos/...
      /cv/page.tsx
      /accesos/page.tsx
/components
  /portfolio/
    CompanyCard.tsx
    WorkCard.tsx
    FeaturedWorkCard.tsx
    WorkContent.tsx
    CVView.tsx
    AboutView.tsx
    PresentationMode.tsx
    WelcomeBanner.tsx
    PinGate.tsx
  /admin/
    DataTable.tsx
    TokenManager.tsx
    TipTapEditor.tsx
    StatsChart.tsx
    TokenComparison.tsx
    VersionHistory.tsx
    ScrollHeatmap.tsx
  /ui/
    Button.tsx
    Badge.tsx
    Dropdown.tsx
    Modal.tsx
    Toggle.tsx
    LanguageSelector.tsx
/lib
  /supabase/                        → client.ts, server.ts, middleware.ts
  /analytics/                       → track.ts, getDuration.ts, getStats.ts, heatmap.ts
  /i18n/                            → ca.json, es.json, en.json, fr.json
  /email/                           → sendNotification.ts (Resend)
  /pdf/                             → CVDocument.tsx (@react-pdf/renderer)
/api
  /analytics/event/route.ts
  /analytics/duration/route.ts
  /analytics/scroll/route.ts
  /cv/pdf/route.ts
  /notify/entry/route.ts
```

---

## NOTAS FINALES PARA LA IA QUE IMPLEMENTE ESTO

1. **Base de datos primero**: crea todas las tablas con RLS correctas. Solo el admin autenticado escribe; las rutas públicas solo leen filtrado por token válido y activo.
2. **Middleware de Next.js**: valida el token en cada request a `/v/[token]/*`. Si el token tiene PIN y no está verificado en sesión → redirige a pantalla de PIN.
3. **Orden de construcción recomendado**: (a) vista pública del portfolio, (b) editor de trabajos y empresas, (c) sistema de tokens y accesos, (d) analíticas avanzadas, (e) notificaciones email.
4. **TipTap**: extensiones StarterKit, Image, Link, Placeholder, CharacterCount, Underline, Blockquote, HorizontalRule.
5. **Server Components por defecto**: `"use client"` solo donde haya interactividad real (editor, charts, drag & drop).
6. **PDF del CV**: Route Handler `/api/cv/pdf` con `@react-pdf/renderer`. Componente `CVDocument` dedicado con las fuentes Playfair + DM Sans.
7. **Historial de versiones**: al guardar un trabajo añade al array `version_history` el objeto `{ timestamp, title, content }`. Limitar a 20 snapshots (eliminar el más antiguo si se supera).
8. **Duplicar trabajo**: copia todos los campos excepto `id`, `slug` (añadir `-copia`), `status` (forzar `draft`) y `created_at`.
9. **Modo presentación**: detectado por query param `?mode=present`. Layout sin navbar. Tecla Esc llama a `router.push` sin el param.
10. **Notificación email**: disparar en servidor tras validar token. Cookie `notified_[token]` con TTL 1h para evitar spam en recargas. Usar Resend con template HTML mínimo.
11. **Scroll tracking en posts**: `scrollY` máximo convertido a porcentaje de `document.body.scrollHeight`. Enviado al salir junto con la duración.
12. **Mapa de calor del CV**: `IntersectionObserver` en cada sección con un ID único. Al salir, enviar array de secciones vistas y su ratio de visibilidad.
13. **Imágenes**: bucket `portfolio-media` en Supabase Storage. Subcarpetas `/covers/`, `/content/`, `/logos/`, `/profile/`.
14. **Open Graph**: usar `generateMetadata()` async que consulta el token en base de datos para personalizar `og:title` y `og:description` por empresa.
