# Diseno Frontend - Tenant Administrativo
## Dashboard de Salud Financiera & Control de Rentabilidad

---

## 1. Vision del Diseno

### Proposito
Centro de mando para PMs, Directores y equipo interno de Appix. El dashboard prioriza la **deteccion temprana de desviaciones financieras** mediante visualizacion de datos en tiempo real, semaforos de alerta y graficas comparativas.

### Principios de Diseno

| Principio | Descripcion |
|-----------|------------|
| **Data-first** | Los datos financieros son protagonistas. UI minimalista para que los numeros hablen |
| **Semaforo inmediato** | El estado de salud de un proyecto debe ser visible en < 1 segundo (color) |
| **Comparacion constante** | Siempre mostrar estimado vs real (Budget vs Actual, Estimated vs Consumed) |
| **Accionable** | Cada alerta lleva a una accion: ver detalle, exportar, ajustar |
| **Accesible** | WCAG AA en todas las vistas, toggle tabla en todas las graficas |

### Audiencia

| Rol | Necesidad principal | Vista mas usada |
|-----|--------------------|--------------------|
| **Project Manager** | Controlar rentabilidad de SUS proyectos | Detalle de Proyecto |
| **Director** | Vision ejecutiva de TODA la cartera | Portfolio |
| **Admin** | Configurar tarifas, gestionar alertas | Billing Roles, Alertas |

---

## 2. Design System - Tokens

### 2.1 Paleta de Colores

```
SEMANTICOS (Salud Financiera)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  critical   #EF4444   ████  Consumo >= 80% & Progreso < 50%│
│  warning    #F59E0B   ████  Desviacion > 15%                │
│  healthy    #10B981   ████  Desviacion <= 10%                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  primary    #3B82F6   ████  Botones, links, barras "Estimado"│
│  accent     #6366F1   ████  Elementos interactivos, hover   │
│  neutral    #64748B   ████  Texto secundario, bordes, inactivo│
│                                                             │
└─────────────────────────────────────────────────────────────┘

BACKGROUNDS & SURFACE
┌─────────────────────────────────────────────────────────────┐
│  bg-page     #F8FAFC   (slate-50)    Fondo de pagina       │
│  bg-card     #FFFFFF                  Tarjetas y paneles    │
│  bg-sidebar  #1E293B   (slate-800)   Sidebar oscuro        │
│  bg-hover    #F1F5F9   (slate-100)   Hover en filas/items  │
│  border      #E2E8F0   (slate-200)   Bordes de tarjetas    │
└─────────────────────────────────────────────────────────────┘

TEXTO
┌─────────────────────────────────────────────────────────────┐
│  text-primary    #0F172A  (slate-900)   Titulos, valores    │
│  text-secondary  #64748B  (slate-500)   Labels, descripciones│
│  text-inverse    #FFFFFF                Texto sobre sidebar │
│  text-link       #3B82F6  (primary)     Links navegables    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Uso de colores por contexto

| Contexto | Color de fondo | Color de texto | Borde |
|----------|---------------|----------------|-------|
| Badge CRITICAL | `bg-red-100` | `text-red-700` | `border-red-200` |
| Badge WARNING | `bg-amber-100` | `text-amber-700` | `border-amber-200` |
| Badge HEALTHY | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` |
| Alerta CRITICAL (banner) | `bg-red-50` | `text-red-800` | `border-l-4 border-red-500` |
| Alerta WARNING (banner) | `bg-amber-50` | `text-amber-800` | `border-l-4 border-amber-500` |
| MetricCard normal | `bg-white` | `text-slate-900` | `border border-slate-200` |
| MetricCard con alerta | `bg-red-50` | `text-red-900` | `border border-red-200` |
| Fila de tabla hover | `bg-slate-50` | - | - |
| Boton primario | `bg-primary` | `text-white` | - |
| Boton secundario | `bg-white` | `text-primary` | `border border-primary` |
| Boton destructivo | `bg-red-600` | `text-white` | - |

### 2.3 Tipografia

```
FONT FAMILY
  Primaria: "Inter", system-ui, sans-serif
  Monospace: "JetBrains Mono", monospace (solo para IDs y codigos)

ESCALA DE TAMANOS
  text-xs     12px   Labels pequeños, timestamps
  text-sm     14px   Texto de tabla, descripciones
  text-base   16px   Texto body, formularios
  text-lg     18px   Subtitulos de seccion
  text-xl     20px   Titulos de tarjeta
  text-2xl    24px   Titulos de pagina
  text-3xl    30px   Metricas grandes (health score)
  text-4xl    36px   Valor principal del Gauge

PESOS
  font-normal    400   Texto body
  font-medium    500   Labels de tabla, subtitulos
  font-semibold  600   Titulos de tarjeta
  font-bold      700   Titulos de pagina, metricas

NUMEROS FINANCIEROS (OBLIGATORIO)
  font-variant-numeric: tabular-nums
  Clase Tailwind: .financial-number { @apply tabular-nums font-semibold }
  Aplicar en: todas las tablas, metricas, graficas, porcentajes, valores monetarios
```

### 2.4 Espaciado & Grid

```
ESPACIADO BASE: 4px (Tailwind default)

LAYOUT GRID
  Sidebar:        w-64 (256px) fijo
  Content area:   flex-1 (fluido)
  Max content:    max-w-7xl (1280px) centrado
  Padding page:   p-6 (24px)
  Gap entre cards: gap-6 (24px)
  Padding card:   p-4 (16px) o p-6 (24px)

GRID DE METRICAS
  Desktop (>=1280px): grid-cols-4
  Tablet (>=768px):   grid-cols-2
  Mobile (<768px):    grid-cols-1

GRID DE GRAFICAS
  Desktop: grid-cols-2 (burndown + phase comparison lado a lado)
  Tablet:  grid-cols-1 (apiladas)
```

### 2.5 Sombras & Bordes

```
TARJETAS
  shadow:     shadow-sm (0 1px 2px rgba(0,0,0,0.05))
  border:     border border-slate-200
  radius:     rounded-lg (8px)

DROPDOWN/POPOVER
  shadow:     shadow-lg
  border:     border border-slate-200
  radius:     rounded-lg

BADGES
  radius:     rounded-full (pill)
  padding:    px-2.5 py-0.5

BOTONES
  radius:     rounded-md (6px)
  padding:    px-4 py-2
```

---

## 3. Arquitectura de Layout

### 3.1 Shell Principal

```
┌──────────────────────────────────────────────────────────────────┐
│ DashboardShell.astro                                             │
│                                                                  │
│ ┌──────────┬─────────────────────────────────────────────────┐  │
│ │          │                                                 │  │
│ │ Sidebar  │  <slot />  (contenido dinamico de cada pagina) │  │
│ │ .astro   │                                                 │  │
│ │          │  PageHeader.astro                               │  │
│ │ w-64     │  ┌─────────────────────────────────────────┐   │  │
│ │ h-screen │  │ Titulo + Subtitulo + [AlertBell]        │   │  │
│ │ fixed    │  └─────────────────────────────────────────┘   │  │
│ │ bg-      │                                                 │  │
│ │ slate-800│  Contenido de pagina                           │  │
│ │          │  ┌─────────────────────────────────────────┐   │  │
│ │ [Logo]   │  │                                         │   │  │
│ │          │  │  React Islands (client:load)            │   │  │
│ │ Nav:     │  │                                         │   │  │
│ │ -Dashboard│  │                                         │   │  │
│ │ -Portfolio│  │                                         │   │  │
│ │ -Tarifas │  │                                         │   │  │
│ │ -Alertas │  │                                         │   │  │
│ │          │  │                                         │   │  │
│ │          │  └─────────────────────────────────────────┘   │  │
│ └──────────┴─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar - Navegacion

```
┌──────────────────┐
│                  │
│  [APPIX LOGO]    │  Fondo: bg-slate-800
│                  │  Texto: text-white
│──────────────────│
│                  │
│  ■ Dashboard     │  / (index.astro)
│                  │  Icono: LayoutDashboard
│  □ Portfolio     │  /portfolio
│                  │  Icono: Briefcase
│  □ Tarifas       │  /billing-roles
│                  │  Icono: DollarSign
│  □ Alertas       │  /alerts
│                  │  Icono: Bell
│  □ Cambios*      │  /change-requests
│                  │  Icono: GitPullRequest
│                  │  (*Release 2)
│                  │
│──────────────────│
│                  │
│  [User Avatar]   │  Nombre del usuario
│  PM / Director   │  Rol
│                  │
└──────────────────┘

Estados de items:
  Activo:   bg-slate-700 text-white font-medium
  Inactivo: text-slate-400 hover:text-white hover:bg-slate-700
  Icono:    w-5 h-5 mr-3
```

---

## 4. Catalogo de Componentes

### 4.1 Componentes Atomicos

#### StatusBadge.tsx

```
Proposito: Indicador visual del estado de salud de un proyecto
Ubicacion: src/components/dashboard/StatusBadge.tsx

Variantes:
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ ⚠ CRITICAL         │  │ ⚠ WARNING          │  │ ✓ HEALTHY          │
│ bg-red-100          │  │ bg-amber-100        │  │ bg-emerald-100     │
│ text-red-700        │  │ text-amber-700      │  │ text-emerald-700   │
│ border-red-200      │  │ border-amber-200    │  │ border-emerald-200 │
└────────────────────┘  └────────────────────┘  └────────────────────┘

Props:
  status: "CRITICAL" | "WARNING" | "HEALTHY"
  size?: "sm" | "md" (default: "md")

Estructura HTML:
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
```

#### MetricCard.tsx

```
Proposito: Tarjeta con valor numerico prominente y label
Ubicacion: src/components/dashboard/MetricCard.tsx

┌─────────────────────────────┐
│  Horas Consumidas           │  <- label (text-sm text-slate-500)
│                             │
│  127.5 / 200                │  <- value (text-2xl font-bold tabular-nums)
│                             │
│  ████████████░░░ 63.7%      │  <- barra de progreso (opcional)
│                             │
│  ▲ +12.3h esta semana       │  <- trend (opcional, text-xs)
└─────────────────────────────┘

Props:
  label: string
  value: string
  subtitle?: string
  trend?: { value: string, direction: "up" | "down" }
  color?: "default" | "critical" | "warning" | "healthy"
  progress?: number (0-100)

Estilos:
  Container: bg-white rounded-lg border border-slate-200 shadow-sm p-4
  Si color="critical": bg-red-50 border-red-200
```

#### AlertBanner.tsx

```
Proposito: Banner de alerta dismissable dentro de un contexto
Ubicacion: src/components/dashboard/AlertBanner.tsx

┌──────────────────────────────────────────────────────────┐
│ ⚠  Proyecto "App Mobile VIVO" ha entrado en estado   [X] │
│    CRITICAL. Consumo al 85% con solo 40% de progreso.    │
└──────────────────────────────────────────────────────────┘

Variantes:
  CRITICAL: border-l-4 border-red-500 bg-red-50 text-red-800
  WARNING:  border-l-4 border-amber-500 bg-amber-50 text-amber-800
  INFO:     border-l-4 border-blue-500 bg-blue-50 text-blue-800

Props:
  type: "critical" | "warning" | "info"
  title: string
  message: string
  dismissable?: boolean
  onDismiss?: () => void
```

#### AlertNotificationBell.tsx

```
Proposito: Icono de campana con badge de conteo + dropdown de alertas
Ubicacion: src/components/dashboard/AlertNotificationBell.tsx

Estado cerrado:                Estado abierto:
┌──────┐                      ┌──────┐
│ 🔔 3 │                      │ 🔔 3 │
└──────┘                      └──┬───┘
                               ┌──┴──────────────────────────┐
                               │ Alertas (3 sin leer)        │
                               ├─────────────────────────────┤
                               │ ⚠ App VIVO - CRITICAL       │
                               │   Hace 15 min          [·]  │
                               ├─────────────────────────────┤
                               │ ⚠ Web Portal - WARNING      │
                               │   Hace 2 horas         [·]  │
                               ├─────────────────────────────┤
                               │ ✓ CRM - HEALTHY             │
                               │   Hace 1 dia           [✓]  │
                               ├─────────────────────────────┤
                               │ Ver todas las alertas →     │
                               └─────────────────────────────┘

Badge: absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full
Dropdown: absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border
Polling: useAlerts() con refetchInterval: 30000 (30s)
```

### 4.2 Componentes de Graficas (Recharts)

#### FinancialBurndownChart.tsx

```
Proposito: Grafica de lineas Budget vs Actual Cost vs Earned Value (US-04)
Ubicacion: src/components/charts/FinancialBurndownChart.tsx

┌──────────────────────────────────────────────────────────┐
│  Financial Burndown                    [Grafico] [Tabla] │
│                                                          │
│  $50k ┤                                                  │
│       │        ....Budget (dashed grey)                   │
│  $40k ┤      ..'                                         │
│       │    ..'    ___Actual Cost (solid red)              │
│  $30k ┤  ..'   _/                                        │
│       │ ..'  _/                                          │
│  $20k ┤..' _/  ---Earned Value (solid green)             │
│       │.._/  -/                                          │
│  $10k ┤_/ -/                                             │
│       │ -/                                               │
│   $0k ┤──────────────────────────────────────            │
│       Ene    Feb    Mar    Abr    May    Jun             │
│                                                          │
│  ── Budget  ── Actual Cost  ── Earned Value              │
└──────────────────────────────────────────────────────────┘

Recharts Config:
  <LineChart>
    <Line dataKey="budgetLine"       stroke="#64748B" strokeDasharray="5 5" />
    <Line dataKey="actualCost"       stroke="#EF4444" strokeWidth={2} />
    <Line dataKey="earnedValue"      stroke="#10B981" strokeWidth={2} />
  </LineChart>

Toggle: TableViewToggle.tsx permite cambiar a AccessibleDataTable.tsx
Datos: useBurndown(projectId) -> BurndownPoint[]
Responsive: height 300px desktop, 200px mobile
```

#### PhaseComparisonChart.tsx

```
Proposito: Barras comparativas Estimado vs Actual por fase (US-06)
Ubicacion: src/components/charts/PhaseComparisonChart.tsx

┌──────────────────────────────────────────────────────────┐
│  Comparacion por Fase                  [Grafico] [Tabla] │
│                                                          │
│  200h ┤                                                  │
│       │                                                  │
│  150h ┤  ┌──┐                                            │
│       │  │Es│┌──┐                                        │
│  100h ┤  │ti││Ac│  ┌──┐                                  │
│       │  │ma││tu│  │Es│┌──┐  ┌──┐                        │
│   50h ┤  │do││al│  │ti││Ac│  │Es│┌──┐  ┌──┐             │
│       │  │  ││  │  │ma││tu│  │ti││Ac│  │Es│┌──┐         │
│    0h ┤──┴──┴┴──┴──┴──┴┴──┴──┴──┴┴──┴──┴──┴┴──┴──       │
│       Planning    Design     Dev        QA               │
│                                                          │
│  ■ Estimado (primary)  ■ Actual (dinamico)               │
└──────────────────────────────────────────────────────────┘

Color dinamico de barras "Actual":
  Si actual <= estimado:     fill="#10B981" (healthy)
  Si actual > estimado +15%: fill="#EF4444" (critical)
  Si actual > estimado:      fill="#F59E0B" (warning)

Recharts Config:
  <BarChart>
    <Bar dataKey="estimatedHours" fill="#3B82F6" />
    <Bar dataKey="actualHours"    fill={dynamicColor} />
  </BarChart>
```

#### HealthGaugeChart.tsx

```
Proposito: Medidor radial del health score (0-100)
Ubicacion: src/components/charts/HealthGaugeChart.tsx

┌──────────────────────┐
│                      │
│      ╭──────╮        │
│    ╱  ████    ╲      │
│   │  ██████    │     │
│   │    73      │     │  <- Score central (text-4xl font-bold)
│   │  HEALTHY   │     │  <- Label (text-sm)
│    ╲          ╱      │
│      ╰──────╯        │
│                      │
└──────────────────────┘

Color del arco:
  score >= 67: fill="#10B981" (healthy)
  score >= 34: fill="#F59E0B" (warning)
  score < 34:  fill="#EF4444" (critical)

Recharts: <RadialBarChart> con innerRadius y outerRadius
Texto central: <text> SVG posicionado con textAnchor="middle"
```

#### HealthTrendChart.tsx

```
Proposito: Grafica de area con historial de health score
Ubicacion: src/components/charts/HealthTrendChart.tsx

┌──────────────────────────────────────────────────────────┐
│  Tendencia de Salud                                      │
│                                                          │
│  100 ┤            ╱\                                     │
│      │           /  \  ╱──╲___                           │
│   67 ┤─ ─ ─ ─ ─/─ ─ \/─ ─ ─ ─\─ ─ ─ ─ Healthy line    │
│      │        /                \                         │
│   34 ┤─ ─ ─/─ ─ ─ ─ ─ ─ ─ ─ ─ \─ ─ ─ Warning line     │
│      │     /                     \___                    │
│    0 ┤────/───────────────────────────                   │
│      Ene    Feb    Mar    Abr    May                     │
└──────────────────────────────────────────────────────────┘

Gradiente: verde arriba, amarillo al medio, rojo abajo
Recharts: <AreaChart> con <defs><linearGradient>
Lineas de referencia: <ReferenceLine y={67} /> y <ReferenceLine y={34} />
```

#### TableViewToggle.tsx + AccessibleDataTable.tsx

```
Proposito: Toggle para cambiar entre vista grafica y tabla accesible (WCAG AA)
Ubicacion: src/components/charts/

Toggle:
  ┌─────────────────────────────┐
  │ [📊 Grafico] [📋 Tabla]    │  <- Segmented control
  └─────────────────────────────┘

  Estado activo: bg-primary text-white
  Estado inactivo: bg-slate-100 text-slate-600
  role="tablist" + role="tab" + aria-selected

Tabla accesible:
  ┌──────────┬──────────┬──────────┬──────────┐
  │ Fecha    │ Budget   │ Actual   │ EV       │  <- <thead> con <th scope="col">
  ├──────────┼──────────┼──────────┼──────────┤
  │ Ene 2026 │ $8,333   │ $7,200   │ $6,800   │  <- <tbody> con tabular-nums
  │ Feb 2026 │ $16,667  │ $15,400  │ $14,200  │
  └──────────┴──────────┴──────────┴──────────┘

  Semantica: <table>, <thead>, <th scope="col">, <tbody>, <td>
  Clase: financial-number en todas las celdas numericas
```

### 4.3 Componentes Compuestos

#### TripleAxisCard.tsx

```
Proposito: Tarjeta principal del Triple Axis Varianza
Ubicacion: src/components/dashboard/TripleAxisCard.tsx

┌──────────────────────────────────────────────────────────────┐
│  Triple Axis Varianza                                        │
│                                                              │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │  Consumo       │ │  Progreso      │ │  Desviacion    │   │
│  │  85.0%         │ │  40.0%         │ │  45.0%         │   │
│  │  ██████████░░░ │ │  ████░░░░░░░░░ │ │  ██████████░░░ │   │
│  │  170h / 200h   │ │  Via Jira      │ │  |85% - 40%|   │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PhaseComparisonChart                                 │   │
│  │  [Barras estimado vs actual por fase]                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⚠ CRITICAL: Consumo al 85% con 40% de progreso.     │   │
│  │   Riesgo de sobrepasar presupuesto.              [X] │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

Composicion:
  3x MetricCard (Consumo, Progreso, Desviacion) en grid-cols-3
  1x PhaseComparisonChart
  1x AlertBanner (condicional: solo si status != HEALTHY)
```

#### PortfolioTable.tsx

```
Proposito: Tabla de todos los proyectos con semaforos (US-05)
Ubicacion: src/components/dashboard/PortfolioTable.tsx

┌──────────────────────────────────────────────────────────────────────┐
│  Filtrar: [Todos ▼]  [Buscar proyecto...]           Ordenar: [▼]    │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Proyecto │ Cliente  │ Consumo  │ Progreso │ Estado   │ Acciones     │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ App VIVO │ Telefon. │ 85.0%    │ 40.0%    │⚠CRITICAL│ [Ver] [PDF]  │
│ Web CRM  │ Retail   │ 52.3%    │ 48.0%    │⚠WARNING │ [Ver] [PDF]  │
│ API Pay  │ FinCo    │ 30.0%    │ 28.5%    │✓HEALTHY │ [Ver] [PDF]  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│                           Pagina 1 de 3                              │
└──────────────────────────────────────────────────────────────────────┘

Funcionalidades:
  - Filtrar por estado: Todos, CRITICAL, WARNING, HEALTHY
  - Buscar por nombre de proyecto
  - Ordenar por cualquier columna (click en header)
  - Click en fila -> navega a /projects/{id}
  - Paginacion (10 por pagina)

Estilos de fila:
  CRITICAL: hover:bg-red-50
  WARNING:  hover:bg-amber-50
  HEALTHY:  hover:bg-emerald-50

Headers: font-medium text-slate-500 text-sm uppercase tracking-wider
Celdas numericas: tabular-nums text-right
```

#### BillingRolesManager.tsx

```
Proposito: CRUD inline de tarifas por rol (US-03)
Ubicacion: src/components/dashboard/BillingRolesManager.tsx

┌──────────────────────────────────────────────────────────────────┐
│  Tarifas por Rol                                    [+ Nueva]    │
├──────────┬──────────────┬─────────────────────────┬─────────────┤
│ Rol      │ Tarifa/Hora  │ Descripcion             │ Acciones    │
├──────────┼──────────────┼─────────────────────────┼─────────────┤
│ Backend  │ $70.00       │ Desarrollo backend      │ [✏] [🗑]    │
│ Frontend │ $65.00       │ Desarrollo frontend     │ [✏] [🗑]    │
│ QA       │ $50.00       │ Testing y QA            │ [✏] [🗑]    │
│ Design   │ $60.00       │ Diseno UI/UX            │ [✏] [🗑]    │
├──────────┼──────────────┼─────────────────────────┼─────────────┤
│ [input]  │ [$0.00]      │ [input]                 │ [Guardar]   │  <- Modo edicion
└──────────┴──────────────┴─────────────────────────┴─────────────┘

Modo edicion inline: la fila se transforma en inputs
Validacion: tarifa > 0, nombre no vacio
Feedback: toast de exito/error tras cada operacion
Mutations: useBillingRoles() con invalidacion de cache
```

#### ProjectDashboard.tsx

```
Proposito: Vista completa del detalle de un proyecto
Ubicacion: src/components/dashboard/ProjectDashboard.tsx

┌──────────────────────────────────────────────────────────────────┐
│  App Mobile VIVO                    ⚠ CRITICAL    [PDF] [Excel]  │
│  Cliente: Telefonica  |  Budget: 200h  |  Margen: 35%           │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│    ┌─────────────────┐      │   ┌──────────┐ ┌──────────┐       │
│    │  Health Gauge    │      │   │ Consumo  │ │ Costo    │       │
│    │     73           │      │   │ 85.0%    │ │ $42,500  │       │
│    │   HEALTHY        │      │   │ 170/200h │ │ de $50k  │       │
│    └─────────────────┘      │   └──────────┘ └──────────┘       │
│                             │   ┌──────────┐ ┌──────────┐       │
│                             │   │ Progreso │ │ Earned V │       │
│                             │   │ 40.0%    │ │ $20,000  │       │
│                             │   │ Via Jira │ │          │       │
│                             │   └──────────┘ └──────────┘       │
├─────────────────────────────┴────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Financial Burndown                    [Grafico] [Tabla]  │   │
│  │  [Grafica de 3 lineas]                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Triple Axis Varianza                                     │   │
│  │  [3 MetricCards + Phase Comparison + Alert]               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tendencia de Salud                                       │   │
│  │  [AreaChart con historial]                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

Grid Layout:
  Header: flex justify-between items-center
  Top row: grid grid-cols-2 (Gauge + 4 MetricCards en 2x2)
  Burndown: col-span-full
  Triple Axis: col-span-full
  Trend: col-span-full
```

#### ExportButtons.tsx

```
Proposito: Botones de exportacion PDF y Excel (US-08)
Ubicacion: src/components/dashboard/ExportButtons.tsx

Estado normal:           Estado loading:
┌──────────┐ ┌──────────┐  ┌───────────────┐
│ 📄 PDF   │ │ 📊 Excel │  │ ⟳ Generando...│
└──────────┘ └──────────┘  └───────────────┘

PDF:   bg-red-50 text-red-700 border-red-200 hover:bg-red-100
Excel: bg-green-50 text-green-700 border-green-200 hover:bg-green-100
Loading: disabled, spinner animado, texto "Generando..."

Descarga: window.open(apiUrl) o fetch + blob + download
```

---

## 5. Mapa de Paginas

### 5.1 Rutas

| Ruta | Archivo | Layout | Componente React Principal |
|------|---------|--------|---------------------------|
| `/` | `index.astro` | DashboardShell | PortfolioTable + AlertNotificationBell |
| `/portfolio` | `portfolio.astro` | DashboardShell | PortfolioTable |
| `/projects/[id]` | `projects/[id].astro` | DashboardShell | ProjectDashboard |
| `/billing-roles` | `billing-roles.astro` | DashboardShell | BillingRolesManager |
| `/alerts` | `alerts.astro` | DashboardShell | AlertsList |
| `/change-requests`* | `change-requests.astro` | DashboardShell | ChangeRequestsTable |

*Release 2

### 5.2 Wireframes de Pagina

#### Pagina: Dashboard Home (`/`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Dashboard                              🔔 3        │
│            │                                                     │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│            │  │Total Proy│ │ Critical │ │ Warning  │ │Healthy ││
│            │  │    12    │ │    2     │ │    3     │ │   7    ││
│            │  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│            │                                                     │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │  Portfolio de Proyectos                       │  │
│            │  │  [PortfolioTable con semaforos]               │  │
│            │  │  ...                                         │  │
│            │  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

#### Pagina: Detalle de Proyecto (`/projects/[id]`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Volver  │  App Mobile VIVO          [PDF][Excel]│
│            │                                                     │
│            │  [ProjectDashboard - ver seccion 4.3]              │
│            │                                                     │
│            │  Gauge + MetricCards                                │
│            │  Burndown Chart                                    │
│            │  Triple Axis Card                                  │
│            │  Health Trend Chart                                │
└──────────────────────────────────────────────────────────────────┘
```

#### Pagina: Alertas (`/alerts`)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Historial de Alertas                              │
│            │                                                     │
│            │  Filtrar: [Todas ▼]  [Solo no leidas ▼]            │
│            │                                                     │
│            │  ┌──────────────────────────────────────────────┐  │
│            │  │ ⚠ CRITICAL - App Mobile VIVO                 │  │
│            │  │   Consumo al 85% con progreso al 40%         │  │
│            │  │   Hace 2 horas                    [Marcar ✓] │  │
│            │  ├──────────────────────────────────────────────┤  │
│            │  │ ⚠ WARNING - Web CRM                          │  │
│            │  │   Desviacion del 18% detectada               │  │
│            │  │   Hace 5 horas                    [Marcar ✓] │  │
│            │  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Flujo de Datos

### 6.1 Arquitectura Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                      ASTRO PAGES (.astro)                    │
│  - Server-side rendered                                     │
│  - Solo layout, no estado                                   │
│  - Pasan props a React Islands via data attributes          │
└──────────────────────────┬──────────────────────────────────┘
                           │ client:load
┌──────────────────────────┴──────────────────────────────────┐
│                    REACT ISLANDS (.tsx)                       │
│  - client:load = hidrata en el browser                      │
│  - Componentes interactivos con estado                      │
│  - Envueltos en QueryProvider                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ useQuery / useMutation
┌──────────────────────────┴──────────────────────────────────┐
│                    REACT QUERY HOOKS                          │
│  - Cache automatico                                         │
│  - Polling (alerts cada 30s)                                │
│  - Invalidacion tras mutations                              │
│  - Estados: loading, error, success                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch
┌──────────────────────────┴──────────────────────────────────┐
│                    financeApi.ts                              │
│  - Funciones tipadas: fetchProjects(), fetchBurndown(), etc │
│  - Validacion Zod en CADA respuesta                         │
│  - Si Zod falla -> error visible, no render con datos malos │
└──────────────────────────┬──────────────────────────────────┘
                           │ axios
┌──────────────────────────┴──────────────────────────────────┐
│                    apiClient.ts (Axios)                       │
│  - baseURL: PUBLIC_API_URL                                  │
│  - withCredentials: true (session cookies)                  │
│  - Request interceptor:  camelCase -> snake_case            │
│  - Response interceptor: snake_case -> camelCase            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────┴──────────────────────────────────┐
│                    DJANGO REST API                            │
│  - /api/v1/finance/*                                        │
│  - /api/v1/integrations/*                                   │
│  - /api/v1/reports/*                                        │
│  - Decimal -> String serialization                          │
│  - Session Auth + CORS                                      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Estados de UI por Hook

| Hook | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| `useProjects()` | Skeleton table | "No hay proyectos" | Toast error + retry | Tabla con datos |
| `useProjectDetail(id)` | Skeleton cards + charts | - | 404 page | Dashboard completo |
| `useBurndown(id)` | Skeleton chart | "Sin datos" placeholder | Error inline | Grafica renderizada |
| `useAlerts()` | Spinner en bell | Badge "0" | Silent retry (polling) | Badge con count |
| `usePortfolio()` | Skeleton table | "Sin proyectos" | Toast error | Tabla + semaforos |
| `useBillingRoles()` | Skeleton table | "Crea tu primera tarifa" | Toast error | Tabla editable |

---

## 7. Responsive Design

### Breakpoints

| Breakpoint | Tailwind | Dispositivo | Layout |
|-----------|----------|-------------|--------|
| < 768px | default | Mobile | Sidebar colapsado, cards stack |
| >= 768px | `md:` | Tablet | Sidebar colapsado, grid 2 cols |
| >= 1024px | `lg:` | Desktop | Sidebar visible, grid 2 cols |
| >= 1280px | `xl:` | Desktop wide | Sidebar + grid 4 cols metricas |

### Comportamiento del Sidebar

```
Mobile/Tablet (< 1024px):
  - Sidebar oculto por defecto
  - Hamburger menu en header
  - Overlay al abrir sidebar

Desktop (>= 1024px):
  - Sidebar fijo a la izquierda
  - Siempre visible
  - Content area se ajusta
```

---

## 8. Accesibilidad (WCAG AA)

| Requisito | Implementacion |
|-----------|---------------|
| Contraste de texto | Todos los textos sobre fondos de color pasan ratio 4.5:1 |
| Graficas accesibles | Toggle Grafico/Tabla en CADA grafica |
| Tablas semanticas | `<table>`, `<thead>`, `<th scope="col">`, `<tbody>` |
| Focus visible | `focus:ring-2 focus:ring-primary focus:ring-offset-2` en todos los interactivos |
| Navegacion teclado | Tab order logico, Enter para acciones, Escape para cerrar |
| ARIA labels | `aria-label` en iconos sin texto, `aria-live` en alertas |
| Screen readers | `sr-only` para textos descriptivos ocultos visualmente |
| Skip navigation | Link "Ir al contenido" al inicio de cada pagina |

---

## 9. Inventario de Archivos (Release 1)

```
frontend/src/
├── env.d.ts
├── styles/
│   └── global.css                          ← Tailwind + .financial-number
├── types/
│   ├── finance.ts                          ← 13 interfaces TypeScript
│   └── api.ts                              ← PaginatedResponse<T>, ApiError
├── services/
│   ├── apiClient.ts                        ← Axios + interceptores
│   ├── financeApi.ts                       ← Funciones API + Zod validation
│   ├── schemas.ts                          ← 10 Zod schemas
│   └── formatters.ts                       ← Format helpers
├── hooks/
│   ├── useProjects.ts                      ← useProjects + useProjectDetail
│   ├── useBurndown.ts                      ← useBurndown(id)
│   ├── usePhaseComparison.ts               ← usePhaseComparison(id)
│   ├── useHealthHistory.ts                 ← useHealthHistory(id)
│   ├── usePortfolio.ts                     ← usePortfolio()
│   ├── useAlerts.ts                        ← useAlerts(30s polling) + useMarkAlertRead
│   └── useBillingRoles.ts                  ← CRUD mutations
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx               ← TanStack Query wrapper
│   ├── layout/
│   │   ├── DashboardShell.astro            ← Sidebar + content area
│   │   ├── Sidebar.astro                   ← Navigation con SVG icons
│   │   └── PageHeader.astro                ← Title + subtitle slot
│   ├── dashboard/
│   │   ├── StatusBadge.tsx                 ← Health status pill
│   │   ├── MetricCard.tsx                  ← Numeric metric display
│   │   ├── AlertBanner.tsx                 ← Dismissable alert
│   │   ├── AlertNotificationBell.tsx       ← Bell + badge + dropdown
│   │   ├── AlertsList.tsx                  ← Full alerts page
│   │   ├── PortfolioTable.tsx              ← Sortable/filterable table
│   │   ├── BillingRolesManager.tsx         ← Inline CRUD table
│   │   ├── TripleAxisCard.tsx              ← 3 metrics + chart + alert
│   │   ├── ProjectDashboard.tsx            ← Full project detail grid
│   │   └── ExportButtons.tsx               ← PDF/Excel download
│   └── charts/
│       ├── FinancialBurndownChart.tsx       ← LineChart (3 lines)
│       ├── PhaseComparisonChart.tsx         ← BarChart (est vs actual)
│       ├── HealthGaugeChart.tsx             ← RadialBarChart
│       ├── HealthTrendChart.tsx             ← AreaChart + gradient
│       ├── TableViewToggle.tsx             ← A11y toggle switch
│       └── AccessibleDataTable.tsx         ← WCAG AA data table
└── pages/
    ├── index.astro                         ← Dashboard Home
    ├── portfolio.astro                     ← Portfolio view
    ├── billing-roles.astro                 ← Billing roles CRUD
    ├── alerts.astro                        ← Alerts history
    └── projects/
        └── [id].astro                      ← Project detail
```

**Total: 38 archivos** (20 componentes, 5 paginas, 7 hooks, 2 tipos, 4 servicios)
