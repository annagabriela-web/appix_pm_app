# Diseno Frontend - Tenant Cliente
## Portal de Transparencia y Seguimiento para Clientes

---

## 1. Vision del Diseno

### Proposito
Portal autoservicio para clientes externos de Appix. El portal fomenta la **confianza y corresponsabilidad** del cliente en el exito del proyecto, ofreciendo visibilidad total sobre su inversion sin exponer datos financieros internos de la agencia.

### Principios de Diseno

| Principio | Descripcion |
|-----------|------------|
| **Simplicidad radical** | El cliente no es tecnico. Cada pantalla debe entenderse en 5 segundos |
| **Transparencia** | Mostrar progreso real, fechas reales, pagos reales. Sin ambiguedad |
| **Confianza** | Colores calidos, lenguaje positivo, sin jerga tecnica |
| **Autoservicio** | El cliente puede resolver sus dudas SIN contactar al PM |
| **Branding del cliente** | Cada tenant muestra el logo y colores del cliente, no de Appix |
| **Mobile-first** | Los clientes revisan desde su celular. Priorizar mobile |

### Diferencias clave vs Tenant Admin

| Aspecto | Admin | Cliente |
|---------|-------|---------|
| Complejidad visual | Alta (graficas, metricas, tablas) | Baja (barras, timelines, cards) |
| Datos financieros | Todos (costos, tarifas, margenes) | Solo montos de su contrato |
| Acciones | CRUD, configuracion, exportes | Ver, marcar entregado, solicitar cambios |
| Lenguaje | Tecnico (consumption %, health score) | Amigable (progreso, pagos, pendientes) |
| Graficas | Recharts complejos (LineChart, BarChart) | Barras de progreso, timelines |
| Color dominante | Slate oscuro (sidebar) | Branding del cliente (dinamico) |
| Navegacion | 5+ items | 4 items maximo |

### Audiencia

| Persona | Necesidad principal | Frecuencia de uso |
|---------|--------------------|--------------------|
| **Director del cliente** | Ver estado general de la inversion | Semanal |
| **PM del cliente** | Seguimiento de entregables y pagos | Cada 2-3 dias |
| **Contacto operativo** | Subir requerimientos, responder solicitudes | Diario |

---

## 2. Design System - Tokens del Tenant Cliente

### 2.1 Paleta de Colores

```
BRANDING DINAMICO (por Organization)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  client-primary  var(--client-primary)   Color del cliente  │
│  client-accent   var(--client-accent)    Secundario cliente │
│                                                             │
│  Estos colores se cargan desde Organization.primary_color   │
│  y se inyectan como CSS custom properties                   │
│                                                             │
│  Ejemplo: Telefonica -> --client-primary: #0066FF           │
│  Ejemplo: Retail Co  -> --client-primary: #FF6B00           │
└─────────────────────────────────────────────────────────────┘

FIJOS (No cambian por cliente)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STATUS COLORES                                             │
│  paid       #10B981  ████  Pagado / Completado / Entregado │
│  upcoming   #F59E0B  ████  Proximo / En progreso           │
│  overdue    #EF4444  ████  Vencido / Pendiente urgente     │
│  inactive   #94A3B8  ████  No iniciado / Inactivo          │
│                                                             │
│  FASES                                                      │
│  completed  #10B981  ████  Fase terminada                   │
│  current    #3B82F6  ████  Fase actual (activa)             │
│  pending    #E2E8F0  ████  Fase futura (por iniciar)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

BACKGROUNDS & SURFACE
┌─────────────────────────────────────────────────────────────┐
│  bg-page       #F9FAFB   (gray-50)     Fondo de pagina    │
│  bg-card       #FFFFFF                  Tarjetas           │
│  bg-sidebar    #FFFFFF                  Sidebar blanco     │
│  bg-header     var(--client-primary)    Header con branding│
│  bg-highlight  #EFF6FF   (blue-50)     Destacar seccion   │
│  border        #E5E7EB   (gray-200)    Bordes suaves      │
└─────────────────────────────────────────────────────────────┘

TEXTO
┌─────────────────────────────────────────────────────────────┐
│  text-primary    #111827  (gray-900)    Titulos, valores   │
│  text-secondary  #6B7280  (gray-500)    Descripciones      │
│  text-inverse    #FFFFFF                Sobre header        │
│  text-link       var(--client-primary)  Links              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Implementacion del Branding Dinamico

```css
/* Inyectado en <style> del layout basado en Organization */
:root {
  --client-primary: #0066FF;    /* Viene de Organization.primary_color */
  --client-accent: #0052CC;     /* Derivado: darken(primary, 10%) */
  --client-light: #E6F0FF;      /* Derivado: lighten(primary, 90%) */
}

/* Uso en Tailwind via @apply o inline */
.client-btn-primary {
  background-color: var(--client-primary);
  color: white;
}
.client-header {
  background-color: var(--client-primary);
}
.client-link {
  color: var(--client-primary);
}
```

### 2.3 Tipografia

```
FONT FAMILY
  Primaria: "Inter", system-ui, sans-serif (misma que admin)

ESCALA (mas conservadora que admin)
  text-sm     14px   Descripciones, ayuda
  text-base   16px   Texto principal, formularios
  text-lg     18px   Subtitulos de seccion
  text-xl     20px   Titulos de tarjeta
  text-2xl    24px   Titulos de pagina
  text-3xl    30px   Numeros destacados (% progreso, montos)

PESOS
  font-normal    400   Texto body
  font-medium    500   Labels, subtitulos
  font-semibold  600   Titulos, valores numericos
  font-bold      700   Solo titulos de pagina

MONTOS FINANCIEROS
  Clase: .financial-number { @apply tabular-nums font-semibold }
  Formato: siempre con separador de miles y simbolo ($12,500.00)
```

### 2.4 Espaciado & Grid

```
LAYOUT
  Sidebar:        w-56 (224px) - mas delgado que admin
  Content area:   flex-1 (fluido)
  Max content:    max-w-5xl (1024px) - mas estrecho que admin
  Padding page:   p-6 md:p-8
  Gap entre cards: gap-4 md:gap-6
  Padding card:   p-5 md:p-6

GRID DE CONTENIDO
  Desktop:  max-w-5xl, cards apiladas (single column dominant)
  Tablet:   full width, cards apiladas
  Mobile:   full width, cards apiladas, padding reducido
```

### 2.5 Sombras & Bordes (mas suaves que admin)

```
TARJETAS
  shadow:     shadow-sm (sutil)
  border:     border border-gray-200
  radius:     rounded-xl (12px) - mas redondeado que admin (8px)

BADGES
  radius:     rounded-full (pill)
  padding:    px-3 py-1

BOTONES
  radius:     rounded-lg (8px)
  padding:    px-5 py-2.5
  Primario:   bg-[var(--client-primary)] text-white shadow-sm
```

---

## 3. Arquitectura de Layout

### 3.1 Shell del Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│ ClientShell.astro                                                │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Header (bg con branding del cliente)                        │  │
│ │ [Logo Cliente]    Mis Proyectos | Pagos | Cambios    🔔 [U]│  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌──────────┬─────────────────────────────────────────────────┐  │
│ │          │                                                 │  │
│ │ Client   │  <slot />  (contenido dinamico)                │  │
│ │ Sidebar  │                                                 │  │
│ │ .astro   │                                                 │  │
│ │          │                                                 │  │
│ │ w-56     │                                                 │  │
│ │ bg-white │                                                 │  │
│ │ border-r │                                                 │  │
│ │          │                                                 │  │
│ │ Nav:     │                                                 │  │
│ │ -Proyectos│                                                │  │
│ │ -Pagos   │                                                 │  │
│ │ -Cambios │                                                 │  │
│ │ -Pendient│                                                 │  │
│ │          │                                                 │  │
│ └──────────┴─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Diferencias de Layout vs Admin

| Elemento | Admin | Cliente |
|----------|-------|---------|
| Sidebar color | `bg-slate-800` (oscuro) | `bg-white` (claro) con borde |
| Header | Integrado en sidebar | Barra superior con branding |
| Logo | Logo Appix fijo | Logo del cliente (dinamico) |
| Sidebar width | w-64 (256px) | w-56 (224px) |
| Content max-width | max-w-7xl (1280px) | max-w-5xl (1024px) |
| Border radius | rounded-lg (8px) | rounded-xl (12px) |
| Overall feeling | Denso, analitico | Espacioso, limpio |

### 3.3 Header con Branding

```
┌──────────────────────────────────────────────────────────────────┐
│  [LOGO]  Mis Proyectos   Pagos   Cambios   Pendientes   🔔  👤  │
│  ████    ─────────────   ─────   ───────   ──────────        │
│  Cliente                                                         │
│  ACME Co                                                         │
└──────────────────────────────────────────────────────────────────┘

Fondo: var(--client-primary) o gradient sutil
Texto: text-white
Logo: Organization.logo (imagen)
Nav activo: border-b-2 border-white font-medium
Nav inactivo: text-white/70 hover:text-white
```

### 3.4 Sidebar del Cliente

```
┌──────────────────┐
│                  │  Fondo: bg-white
│  MIS PROYECTOS   │  Titulo de seccion
│──────────────────│
│                  │
│  ■ Resumen       │  /client/dashboard
│                  │  Icono: Home
│  □ Pagos         │  /client/payments  (alias de /client/projects/[id] seccion pagos)
│                  │  Icono: CreditCard
│  □ Cambios       │  /client/change-requests
│                  │  Icono: FileEdit
│  □ Pendientes    │  /client/requirements
│                  │  Icono: ClipboardList
│                  │
│──────────────────│
│                  │
│  NOTIFICACIONES  │
│  □ Ver todas     │  /client/notifications
│                  │  Icono: Bell
│                  │
│──────────────────│
│                  │
│  [Soporte]       │  mailto: o link a soporte
│  Cerrar sesion   │  Logout
│                  │
└──────────────────┘

Estados de items:
  Activo:   bg-[var(--client-light)] text-[var(--client-primary)] font-medium border-l-3
  Inactivo: text-gray-600 hover:bg-gray-50 hover:text-gray-900
```

---

## 4. Catalogo de Componentes

### 4.1 Componentes Atomicos del Portal

#### ClientProjectCard.tsx

```
Proposito: Tarjeta resumen de un proyecto del cliente
Unica vista: /client/dashboard

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  App Mobile VIVO                                    →       │
│                                                              │
│  ████████████████████░░░░░░░░  68%                          │
│                                                              │
│  Etapa actual: Desarrollo                                   │
│  Ultimo avance: Hace 2 dias                                 │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐        │
│  │ 🕐 4 fases│  │ 💳 3 pagos   │  │ 📋 2 pendientes│        │
│  │ completas │  │ al dia       │  │ por entregar   │        │
│  └──────────┘  └──────────────┘  └────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Estilos:
  Container: bg-white rounded-xl border border-gray-200 shadow-sm p-6
             hover:shadow-md hover:border-[var(--client-primary)] transition
  Barra progreso: h-3 rounded-full bg-gray-100
    Fill: bg-[var(--client-primary)] rounded-full transition-all
  Porcentaje: text-3xl font-bold text-[var(--client-primary)]
  Mini stats: flex gap-4, text-sm text-gray-500
  Flecha: text-gray-400 hover:text-[var(--client-primary)]

Props:
  project: ClientProject
  onClick: () => void
```

#### PhaseProgressBar.tsx

```
Proposito: Barra de progreso de una fase individual
Uso: dentro de PhaseTimeline y ClientProjectOverview

┌──────────────────────────────────────────┐
│  Desarrollo                       45%    │
│  ██████████████░░░░░░░░░░░░░░░░░░░░     │
│  Inicio: 15 Mar  |  Fin est: 20 May     │
└──────────────────────────────────────────┘

Colores por estado:
  Completada (100%): bg-emerald-500 (paid/completed green)
  En curso:          bg-[var(--client-primary)]
  No iniciada (0%):  bg-gray-200

Props:
  name: string
  progress: number (0-100)
  status: "completed" | "current" | "pending"
  startDate?: string
  endDate?: string
```

#### PaymentStatusBadge.tsx

```
Proposito: Badge de estado de un hito de pago

Variantes:
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ ✓ Pagado       │  │ ⏰ Proximo     │  │ ⚠ Vencido      │
│ bg-emerald-100 │  │ bg-amber-100   │  │ bg-red-100     │
│ text-emerald-700│ │ text-amber-700 │  │ text-red-700   │
└────────────────┘  └────────────────┘  └────────────────┘

Props:
  status: "paid" | "upcoming" | "overdue" | "pending"
```

#### RequirementStatusBadge.tsx

```
Variantes:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📋 Pendiente     │  │ ✓ Entregado      │  │ ✓✓ Verificado    │
│ bg-amber-100     │  │ bg-blue-100      │  │ bg-emerald-100   │
│ text-amber-700   │  │ text-blue-700    │  │ text-emerald-700 │
└──────────────────┘  └──────────────────┘  └──────────────────┘

Props:
  status: "pending" | "delivered" | "verified"
```

### 4.2 Componentes de Visualizacion

#### PhaseTimeline.tsx

```
Proposito: Timeline visual de fases del proyecto con etapa actual destacada (US-13)

┌──────────────────────────────────────────────────────────────┐
│  Fases del Proyecto                                          │
│                                                              │
│  ●━━━━━━━●━━━━━━━●━━━━━━━○━━━━━━━○                         │
│  │       │       │       │       │                          │
│  Plan.   Diseno  Desarr. QA      Entrega                    │
│  100%    100%    45%     0%      0%                         │
│  ✓       ✓       ●       ○       ○                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Etapa actual: Desarrollo                           │    │
│  │  Progreso: 45%  ███████████░░░░░░░░░░░░░            │    │
│  │  Inicio: 15 Mar 2026                               │    │
│  │  Estimacion de fin: 20 May 2026                    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

Nodos del timeline:
  Completado (✓): bg-emerald-500 text-white, linea bg-emerald-500
  Actual (●):     bg-[var(--client-primary)] text-white, borde pulsante
  Pendiente (○):  bg-gray-200 text-gray-400, linea bg-gray-200

Etapa actual card:
  bg-[var(--client-light)] border border-[var(--client-primary)]/20 rounded-xl p-4

Props:
  phases: Phase[]
  currentPhaseId: string
```

#### ClientProjectOverview.tsx

```
Proposito: Vista general del progreso del proyecto para el cliente

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Progreso General                                            │
│                                                              │
│  ████████████████████████████████░░░░░░░░░░░  68%           │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Planeacion│ │  Diseno  │ │Desarrollo│ │    QA    │       │
│  │          │ │          │ │          │ │          │       │
│  │  ████    │ │  ████    │ │  ███░    │ │  ░░░░   │       │
│  │  100%    │ │  100%    │ │  45%     │ │  0%     │       │
│  │   ✓      │ │   ✓      │ │  ●       │ │  ○      │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Barra general:
  Height: h-4 rounded-full
  Background: bg-gray-100
  Fill: bg-[var(--client-primary)] rounded-full
  Porcentaje: text-3xl font-bold a la derecha

Grid de fases:
  grid grid-cols-2 md:grid-cols-4 gap-4
  Cada fase: bg-white rounded-xl border p-4 text-center

Props:
  project: ClientProject
  phases: Phase[]
```

#### PaymentMilestonesTable.tsx

```
Proposito: Tabla de hitos de pago con status visual (US-14)

┌──────────────────────────────────────────────────────────────────┐
│  Hitos de Pago                                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ✓  Anticipo (30%)                                        │ │
│  │     $15,000.00                                   Pagado   │ │
│  │     Fecha: 15 marzo 2026                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⏰ Entrega de Diseno (20%)                                │ │
│  │     $10,000.00                             Vence en 5 dias│ │
│  │     Fecha: 20 julio 2026                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ○  Entrega Final (50%)                                    │ │
│  │     $25,000.00                                 Pendiente  │ │
│  │     Fecha: 15 septiembre 2026                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Resumen                                                  │   │
│  │  Total: $50,000  │  Pagado: $15,000  │  Pendiente: $35,000│  │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

Estilos por status:
  Pagado:    border-l-4 border-emerald-500 bg-emerald-50/50
  Proximo:   border-l-4 border-amber-500 bg-amber-50/50
  Vencido:   border-l-4 border-red-500 bg-red-50/50
  Pendiente: border-l-4 border-gray-300 bg-white

Card de resumen:
  bg-gray-50 rounded-xl p-4 grid grid-cols-3
  Montos: text-xl font-bold tabular-nums

Props:
  milestones: PaymentMilestone[]
  projectTotal: string (Decimal as string)
```

#### InvoiceStatusCard.tsx

```
Proposito: Resumen visual de facturacion

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Facturacion                                                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Total      │  │ Pagado     │  │ Pendiente  │            │
│  │ $50,000    │  │ $15,000    │  │ $35,000    │            │
│  │            │  │ ████       │  │ ████████   │            │
│  │ 100%       │  │ 30%        │  │ 70%        │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  Proximo pago: $10,000 - 20 julio 2026 (en 5 dias)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Colores:
  Total:     text-gray-900, barra bg-gray-300
  Pagado:    text-emerald-700, barra bg-emerald-500
  Pendiente: text-amber-700, barra bg-amber-500

Proximo pago alert:
  Si en < 7 dias: bg-amber-50 text-amber-800 border-amber-200
  Si vencido:     bg-red-50 text-red-800 border-red-200
```

### 4.3 Componentes de Gestion

#### ClientRequirementsPanel.tsx

```
Proposito: Lista de pendientes del cliente con accion "Entregar" (US-15)

┌──────────────────────────────────────────────────────────────────┐
│  Pendientes por Entregar                          2 pendientes   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📋 Logo vectorial en formato SVG              Pendiente   │ │
│  │                                                            │ │
│  │  Necesitamos el logo en formato vectorial para las        │ │
│  │  pantallas de carga de la aplicacion.                     │ │
│  │                                                            │ │
│  │  Fecha limite: 25 julio 2026 (en 3 dias)                 │ │
│  │                                                            │ │
│  │                                    [Marcar como entregado]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ✓ Contenido de la seccion "Acerca de"        Entregado   │ │
│  │                                                            │ │
│  │  Textos e imagenes para la pagina institucional.          │ │
│  │                                                            │ │
│  │  Entregado: 18 julio 2026                                 │ │
│  │  Estado: Verificado por el equipo ✓✓                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Estilos por status:
  Pendiente:  border-l-4 border-amber-400, boton [Marcar como entregado] visible
  Entregado:  border-l-4 border-blue-400, badge "Entregado", sin boton
  Verificado: border-l-4 border-emerald-400, badge "Verificado ✓✓"
  Vencido:    border-l-4 border-red-400, bg-red-50/30, label "Vencido" en rojo

Boton "Marcar como entregado":
  bg-[var(--client-primary)] text-white rounded-lg px-4 py-2
  Confirmacion: "Estas seguro de marcar como entregado?" (dialog)
```

#### ClientChangeRequestForm.tsx

```
Proposito: Formulario simplificado para que el cliente solicite cambios

┌──────────────────────────────────────────────────────────────────┐
│  Solicitar un Cambio                                             │
│                                                                  │
│  Que te gustaria cambiar o agregar?                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Titulo del cambio                                         │ │
│  │  [input text]                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Describelo con detalle                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [textarea - min 3 filas]                                  │ │
│  │                                                            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Prioridad                                                       │
│  ( ) Baja - No es urgente                                       │
│  (●) Media - Me gustaria pronto                                 │
│  ( ) Alta - Es critico para el proyecto                         │
│                                                                  │
│  Nota: Nuestro equipo revisara tu solicitud y te enviara una    │
│  cotizacion con el tiempo y costo estimado.                     │
│                                                                  │
│                              [Cancelar]  [Enviar Solicitud]     │
└──────────────────────────────────────────────────────────────────┘

Lenguaje: amigable, sin jerga tecnica
  "Titulo del cambio" (no "Change Request Title")
  "Describelo con detalle" (no "Description")
  "Me gustaria pronto" (no "Medium priority")

Campos NO visibles para el cliente:
  estimated_hours, estimated_cost, approved_by (internos del PM)

Post-envio: mensaje de exito + redirect a lista de cambios
```

#### ClientChangeRequestsList.tsx

```
Proposito: Vista de solicitudes de cambio del cliente con status

┌──────────────────────────────────────────────────────────────────┐
│  Mis Solicitudes de Cambio                    [+ Nueva solicitud]│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Agregar seccion de testimonios              En revision   │ │
│  │                                                            │ │
│  │  Solicitado: 10 julio 2026                                │ │
│  │                                                            │ │
│  │  ○ Enviado → ● En revision → ○ Cotizado → ○ Aprobado     │ │
│  │                                                            │ │
│  │  [Ver detalle →]                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cambiar paleta de colores del landing       Cotizado      │ │
│  │                                                            │ │
│  │  Cotizacion: 12 horas adicionales                         │ │
│  │                                                            │ │
│  │  ○ Enviado → ✓ Revisado → ● Cotizado → ○ Aprobado        │ │
│  │                                                            │ │
│  │  [Ver cotizacion]  [Aprobar]  [Rechazar]                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Timeline mini (dentro de cada card):
  Nodos completados:  ✓ text-emerald-500
  Nodo actual:        ● text-[var(--client-primary)]
  Nodos pendientes:   ○ text-gray-300

Lenguaje de estados (amigable para cliente):
  SUBMITTED  -> "En revision"
  QUOTED     -> "Cotizado" (con boton Aprobar/Rechazar)
  APPROVED   -> "Aprobado - en progreso"
  COMPLETED  -> "Implementado ✓"
  REJECTED   -> "Rechazado"

Datos NO visibles para el cliente:
  estimated_cost (costo interno), assigned_to (PM interno)
  Solo muestra: estimated_hours (si cotizado)
```

#### NotificationCenter.tsx

```
Proposito: Centro de notificaciones (compartido con Admin, adaptado visualmente)

Estado en header:
┌──────┐
│ 🔔 5 │  Badge: bg-red-500 text-white
└──┬───┘
   │
┌──┴──────────────────────────────────┐
│ Notificaciones                       │
├─────────────────────────────────────┤
│ 💳 Pago proximo: Entrega Diseno     │
│    Vence en 5 dias - $10,000        │
│    Hace 1 hora                      │
├─────────────────────────────────────┤
│ 📋 Nuevo pendiente asignado         │
│    Logo vectorial en SVG            │
│    Hace 3 horas                     │
├─────────────────────────────────────┤
│ ✓ Tu solicitud fue cotizada         │
│    12 horas adicionales             │
│    Hace 1 dia                       │
├─────────────────────────────────────┤
│ Ver todas →                          │
└─────────────────────────────────────┘

Iconos por tipo:
  Pago proximo/vencido:  💳 (credit card)
  Requerimiento nuevo:   📋 (clipboard)
  CR actualizado:        🔄 (refresh)
  Proyecto actualizado:  📊 (chart)

Polling: useNotifications() refetchInterval: 30000
```

---

## 5. Mapa de Paginas

### 5.1 Rutas del Portal Cliente

| Ruta | Archivo | Layout | Componente React Principal |
|------|---------|--------|---------------------------|
| `/client/dashboard` | `client/dashboard.astro` | ClientShell | ClientProjectCard[] |
| `/client/projects/[id]` | `client/projects/[id].astro` | ClientShell | ClientProjectOverview + PhaseTimeline + PaymentMilestonesTable |
| `/client/change-requests` | `client/change-requests.astro` | ClientShell | ClientChangeRequestsList |
| `/client/change-requests/new` | `client/change-requests/new.astro` | ClientShell | ClientChangeRequestForm |
| `/client/requirements` | `client/requirements.astro` | ClientShell | ClientRequirementsPanel |
| `/client/notifications` | `client/notifications.astro` | ClientShell | NotificationsList |

### 5.2 Wireframes de Pagina

#### Dashboard del Cliente (`/client/dashboard`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo ACME]   Proyectos  Pagos  Cambios  Pendientes    🔔  👤  │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │  Bienvenido, Carlos                                  │
│          │  ACME Corporation                                    │
│          │                                                       │
│          │  Tus Proyectos                                       │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │  App Mobile VIVO                         →    │   │
│          │  │  ██████████████████░░░░░░░░  68%              │   │
│          │  │  Etapa: Desarrollo | 3 pagos al dia          │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │  Web Institucional                       →    │   │
│          │  │  ██████████████████████████████░░  92%        │   │
│          │  │  Etapa: QA | Proximo pago en 10 dias         │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
│          │  ┌────────────────────────────────────────┐          │
│          │  │ 📋 Tienes 2 pendientes por entregar    │          │
│          │  │    [Ver pendientes →]                   │          │
│          │  └────────────────────────────────────────┘          │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Detalle de Proyecto (`/client/projects/[id]`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo ACME]   Proyectos  Pagos  Cambios  Pendientes    🔔  👤  │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │  ← Mis Proyectos                                    │
│          │                                                       │
│          │  App Mobile VIVO                                     │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  PROGRESO GENERAL                               │  │
│          │  │                                                 │  │
│          │  │  ██████████████████████░░░░░░░░░░  68%         │  │
│          │  │                                                 │  │
│          │  │  ●━━━━━●━━━━━●━━━━━○━━━━━○                    │  │
│          │  │  Plan. Diseno Desarr. QA   Entrega             │  │
│          │  │  100%  100%   45%    0%    0%                  │  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  HITOS DE PAGO                                  │  │
│          │  │                                                 │  │
│          │  │  ✓ Anticipo 30%       $15,000    Pagado        │  │
│          │  │  ⏰ Entrega Diseno    $10,000    En 5 dias     │  │
│          │  │  ○ Entrega Final      $25,000    Pendiente     │  │
│          │  │                                                 │  │
│          │  │  Total $50,000 | Pagado $15,000 | Pend $35,000│  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  PENDIENTES                                     │  │
│          │  │  📋 Logo vectorial SVG          [Entregar]     │  │
│          │  │  ✓ Contenido "Acerca de"        Verificado     │  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  CAMBIOS SOLICITADOS            [+ Solicitar]  │  │
│          │  │  Testimonios - En revision                     │  │
│          │  │  Colores landing - Cotizado [Aprobar][Rechazar]│  │
│          │  └────────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Solicitudes de Cambio (`/client/change-requests`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo ACME]   Proyectos  Pagos  Cambios  Pendientes    🔔  👤  │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │  Solicitudes de Cambio             [+ Nueva solicitud]│
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  Agregar testimonios             En revision    │  │
│          │  │  App Mobile VIVO                               │  │
│          │  │  ○━━●━━○━━○                                    │  │
│          │  │  Enviado > En revision > Cotizado > Aprobado   │  │
│          │  │                                    [Ver →]     │  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │  Cambiar colores landing         Cotizado      │  │
│          │  │  Web Institucional                             │  │
│          │  │  ✓━━✓━━●━━○                                    │  │
│          │  │  12 horas adicionales                          │  │
│          │  │                   [Aprobar]  [Rechazar] [Ver →]│  │
│          │  └────────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────────┘
```

---

## 6. Flujo de Datos

### 6.1 Arquitectura (identica a Admin con variaciones)

```
┌─────────────────────────────────────────────────────────────┐
│                      ASTRO PAGES (.astro)                    │
│  - pages/client/*.astro                                     │
│  - ClientShell.astro como layout                            │
│  - Inyeccion de CSS custom properties (branding)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ client:load
┌──────────────────────────┴──────────────────────────────────┐
│                    REACT ISLANDS (.tsx)                       │
│  - Componentes del portal cliente                           │
│  - NO reutilizan componentes del admin (UX diferente)       │
│  - SI reutilizan: NotificationCenter, QueryProvider         │
└──────────────────────────┬──────────────────────────────────┘
                           │ useQuery / useMutation
┌──────────────────────────┴──────────────────────────────────┐
│               HOOKS EXCLUSIVOS DEL CLIENTE                   │
│  - useClientProjects()                                      │
│  - usePaymentMilestones(projectId)                          │
│  - useClientRequirements(projectId)                         │
│  - useClientChangeRequests()                                │
│  - useNotifications() (compartido, filtrado por rol)        │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch
┌──────────────────────────┴──────────────────────────────────┐
│                    clientApi.ts                               │
│  - Endpoints exclusivos para rol=client                     │
│  - Validacion Zod con schemas del cliente                   │
│  - NUNCA expone: cost, hourly_rate, health_score, margin    │
└──────────────────────────┬──────────────────────────────────┘
                           │ axios (mismo apiClient.ts)
┌──────────────────────────┴──────────────────────────────────┐
│                    DJANGO REST API                            │
│  - TenantMiddleware filtra por Organization                 │
│  - Permisos: IsClient solo lectura (excepto mark delivered) │
│  - Serializers REDUCIDOS (sin datos internos)               │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Datos que el cliente NUNCA ve

| Campo interno | Motivo |
|---------------|--------|
| `cost` / `actual_cost` | Costos internos de la agencia |
| `hourly_rate` / `default_hourly_rate` | Tarifas confidenciales |
| `health_score` / `health_status` | Metrica interna del Triple Axis |
| `budget_hours` (detallado) | Horas presupuestadas internas |
| `target_margin` | Margen de ganancia de Appix |
| `consumption_percent` | Calculo interno de consumo |
| `earned_value` | Metrica de valor ganado |
| Datos de otros clientes | Aislamiento multi-tenant |

### 6.3 Datos que el cliente SI ve

| Campo | Formato | Fuente |
|-------|---------|--------|
| Nombre del proyecto | Texto | Project.name |
| Progreso general (%) | Porcentaje | Calculado de fases |
| Fases con progreso | Lista con % | Phase.progress |
| Etapa actual | Texto + badge | Phase actual |
| Hitos de pago | Monto + fecha + status | PaymentMilestone |
| Total facturado vs pagado | Montos | Sum de milestones |
| Requerimientos pendientes | Lista con status | ClientRequirement |
| Solicitudes de cambio | Lista con status | ChangeRequest (filtrado) |
| Horas cotizadas de CR | Numero | ChangeRequest.estimated_hours |
| Notificaciones | Lista | Notification (filtrado) |

---

## 7. Responsive Design

### Mobile-First (prioridad para el portal cliente)

| Breakpoint | Tailwind | Dispositivo | Layout |
|-----------|----------|-------------|--------|
| < 640px | default | Mobile | Stack vertical, sidebar oculto, header compacto |
| >= 640px | `sm:` | Mobile grande | Stack vertical, sidebar oculto |
| >= 768px | `md:` | Tablet | Sidebar colapsable, 2 cols en dashboard |
| >= 1024px | `lg:` | Desktop | Sidebar visible, content max-w-5xl |

### Comportamiento Mobile

```
Mobile (< 768px):
┌─────────────────────────┐
│ [☰] ACME Co.     🔔 👤 │  <- Header compacto
├─────────────────────────┤
│                         │
│  App Mobile VIVO        │  <- Cards full-width apiladas
│  ██████████████░░ 68%   │
│  Etapa: Desarrollo      │
│                         │
├─────────────────────────┤
│                         │
│  Web Institucional      │
│  ██████████████████ 92% │
│  Etapa: QA              │
│                         │
├─────────────────────────┤
│                         │
│  📋 2 pendientes        │
│  [Ver →]                │
│                         │
└─────────────────────────┘

Sidebar: overlay de izquierda con [☰] toggle
Header: se comprime, logo mas pequeño
Cards: width 100%, padding reducido (p-4)
Timeline: scroll horizontal si no cabe
```

---

## 8. Pagina de Login del Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                      [APPIX LOGO]                               │
│                                                                  │
│                  Portal de Clientes                              │
│                                                                  │
│              ┌────────────────────────────┐                      │
│              │                            │                      │
│              │  Correo electronico        │                      │
│              │  [input email]             │                      │
│              │                            │                      │
│              │  Contrasena                │                      │
│              │  [input password]     [👁] │                      │
│              │                            │                      │
│              │  [    Iniciar Sesion    ]  │                      │
│              │                            │                      │
│              │  Olvidaste tu contrasena?  │                      │
│              │                            │                      │
│              └────────────────────────────┘                      │
│                                                                  │
│              Powered by Appix                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Estilos:
  Background: bg-gray-50
  Card: bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto
  Boton: bg-primary (Appix blue), NOT client-primary (no se conoce aun)
  Logo: Logo de Appix (generico, pre-login)
  Post-login: redirect a /client/dashboard, layout con branding del cliente
```

---

## 9. Accesibilidad (WCAG AA)

| Requisito | Implementacion en portal cliente |
|-----------|--------------------------------|
| Contraste | Verificar que var(--client-primary) pasa 4.5:1 sobre blanco |
| Focus | `focus:ring-2 focus:ring-[var(--client-primary)]` en interactivos |
| Formularios | Labels visibles (no placeholders como labels), mensajes de error claros |
| Botones | Texto descriptivo ("Marcar como entregado", no solo iconos) |
| Timeline | aria-label en cada nodo ("Fase Desarrollo: 45% completado") |
| Tablas | <th scope="col"> en todas las tablas de pagos |
| Lenguaje | Claro y sin jerga tecnica, instrucciones en cada formulario |
| Mobile | Touch targets >= 44x44px, spacing adecuado |

---

## 10. Inventario de Archivos (Release 2 - Portal Cliente)

```
frontend/src/
├── types/
│   └── client.ts                           ← Interfaces del portal cliente
├── services/
│   ├── clientApi.ts                        ← API functions para cliente
│   └── clientSchemas.ts                    ← Zod schemas para datos de cliente
├── hooks/
│   ├── useClientProjects.ts                ← Proyectos del cliente
│   ├── usePaymentMilestones.ts             ← Hitos de pago
│   ├── useClientRequirements.ts            ← Requerimientos/pendientes
│   ├── useClientChangeRequests.ts          ← Solicitudes de cambio
│   └── useNotifications.ts                 ← Notificaciones (compartido)
├── components/
│   ├── client-layout/
│   │   ├── ClientShell.astro               ← Layout con branding
│   │   ├── ClientSidebar.astro             ← Nav simplificada
│   │   └── ClientHeader.astro              ← Header con logo del cliente
│   ├── client/
│   │   ├── ClientProjectCard.tsx           ← Tarjeta de proyecto
│   │   ├── ClientProjectOverview.tsx       ← Progreso general + fases grid
│   │   ├── PhaseTimeline.tsx               ← Timeline visual de fases
│   │   ├── PhaseProgressBar.tsx            ← Barra de progreso individual
│   │   ├── PaymentMilestonesTable.tsx      ← Tabla de hitos de pago
│   │   ├── PaymentStatusBadge.tsx          ← Badge paid/upcoming/overdue
│   │   ├── InvoiceStatusCard.tsx           ← Resumen de facturacion
│   │   ├── ClientRequirementsPanel.tsx     ← Lista de pendientes
│   │   ├── RequirementStatusBadge.tsx      ← Badge pending/delivered/verified
│   │   ├── ClientChangeRequestForm.tsx     ← Formulario de solicitud
│   │   ├── ClientChangeRequestsList.tsx    ← Lista de CRs del cliente
│   │   └── ClientLoginForm.tsx             ← Formulario de login
│   └── notifications/
│       └── NotificationCenter.tsx          ← Compartido admin + client
└── pages/
    └── client/
        ├── login.astro                     ← Login del portal
        ├── dashboard.astro                 ← Home del cliente
        ├── requirements.astro              ← Pendientes
        ├── change-requests.astro           ← Lista de CRs
        ├── change-requests/
        │   └── new.astro                   ← Formulario nueva solicitud
        ├── notifications.astro             ← Historial notificaciones
        └── projects/
            └── [id].astro                  ← Detalle de proyecto

Archivos nuevos: ~28 archivos
  12 componentes (.tsx)
  6 paginas (.astro)
  3 layout (.astro)
  5 hooks (.ts)
  2 services (.ts)
```

---

## 11. Resumen Comparativo: Admin vs Cliente

| Dimension | Tenant Admin | Tenant Cliente |
|-----------|-------------|----------------|
| **Paginas** | 5 (+1 R2) | 7 |
| **Componentes** | 20 | 15 |
| **Hooks** | 7 | 5 |
| **Color de sidebar** | Slate-800 (oscuro) | Blanco con borde |
| **Color primario** | `#3B82F6` (fijo) | `var(--client-primary)` (dinamico) |
| **Graficas** | 4 (Recharts complejos) | 0 (solo barras CSS) |
| **Datos financieros** | Completos | Solo montos de contrato |
| **Acciones de escritura** | CRUD completo | Marcar entregado, crear CR |
| **Responsive priority** | Desktop-first | Mobile-first |
| **Border radius** | 8px (rounded-lg) | 12px (rounded-xl) |
| **Max-width contenido** | 1280px | 1024px |
| **Complejidad visual** | Alta | Baja |
| **Target de usuario** | Equipo tecnico | Cliente no-tecnico |
