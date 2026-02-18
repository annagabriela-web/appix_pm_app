# Appix Financial Dashboard — Estado del Proyecto

> **Ultima actualización:** 2026-02-18
> **Proyecto piloto:** Capturando México (CAP-MX)

---

## 1. Resumen Ejecutivo

Dashboard de rentabilidad y gestión de proyectos para Appix. Permite a PMs y Directores monitorear en tiempo real: horas consumidas vs presupuestadas, costos reales vs cotizados, estado de facturación por etapa, y progreso de sprints con entregables.

### Estado actual
- **Backend:** Django API funcional con datos reales de CAP-MX cargados via CSV
- **Frontend:** Dashboard interactivo con 4 secciones principales
- **Datos:** Importación manual desde Clockify CSVs (44 time entries, 98.25h, 3 colaboradores)
- **Próximo paso:** Integración automática con APIs (Clockify, Jira, Zoho Books)

---

## 2. Arquitectura de la Vista de Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER — Cliente, clave Jira, badge de salud (CRITICAL)     │
├─────────────────────────────────────────────────────────────┤
│ KPI STRIP — Cotización | Cobrado (%) | Costo Real | Horas   │
├────────────────────────────┬────────────────────────────────┤
│ ETAPAS DEL PROYECTO        │ DISTRIBUCIÓN DE HORAS          │
│                            │                                │
│ ✓ 1. Cimentación    53/10h│  ScatterChart: cada punto =    │
│   $26.5k / $12.0k  Pagada │  un registro de Clockify       │
│                            │  coloreado por sprint          │
│ ○ 2. Carga         31/10h │                                │
│   $15.5k / $4.0k Pendiente│  Leyenda: 5 sprints con       │
│                            │  colores distintos             │
│ ○ 3. Desarrollo     6/18h │                                │
│   $3.0k / $4.0k  Pendiente│                                │
│                            │                                │
│ ○ 4. Responsive     8/5h  │                                │
│   $4.1k / $2.5k  Pendiente│                                │
│                            │                                │
│ ○ 5. Capacitación   0/5h  │                                │
│   $0 / $1.5k     Pendiente│                                │
├────────────────────────────┴────────────────────────────────┤
│ SPRINTS — Tabs por sprint con:                              │
│ • Header + KPIs (avances/cambios/solicitudes)               │
│ • Gráfica de horas por tarea y colaborador                  │
│ • Lista de entregables con estados                          │
│ • Dialogs para crear/revisar avances y cambios              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Lógica de Negocio Clave

### 3.1 Tarjeta de Etapas (ProjectPhasesCard)

| Elemento | Lógica |
|----------|--------|
| **Color de barra** | Verde = etapa pagada (isPaid), Ámbar = pendiente con trabajo, Gris = sin trabajo |
| **Icono** | ✓ verde = pagada, ○ gris = pendiente |
| **Horas** | `actualHours / estimatedHours` — rojo si sobreconsumida |
| **Financiero** | `actualCost / invoiceAmount` — costo real vs cotizado por etapa |
| **Tasa horaria** | Derivada: `project.actualCost / project.consumedHours` (~$500 MXN/hr) |

**Por qué importa:** Si una etapa cotizada en $12,000 consume $26,500 en horas reales, la pérdida es inmediata y visible.

### 3.2 KPI Strip

| KPI | Fuente | Color condicional |
|-----|--------|-------------------|
| **Cotización** | `project.clientInvoiceAmount` | Siempre negro |
| **Cobrado** | Suma de `invoiceAmount` de fases con `isPaid=true` | Ámbar si <50%, verde si ≥50% |
| **Costo Real** | `project.actualCost` | Rojo si > cotización |
| **Horas** | `project.consumedHours / project.budgetHours` | Rojo si consumidas > presupuesto |

### 3.3 Jitter Chart (Distribución de Horas)

- Cada **punto** = un registro de tiempo real de Clockify
- **Eje X** = fecha, **Eje Y** = duración en horas
- **Color** = sprint asignado (5 colores distintos)
- **Jitter determinístico** para evitar superposición sin perder estabilidad visual
- **Leyenda compacta**: solo color + nombre de sprint (sin métricas redundantes)

### 3.4 Sprints (5 sprints = 5 etapas)

| Sprint | Etapa | Horas Est. |
|--------|-------|------------|
| S1 — Cimentación y Prototipado | Kick-off, estructura web, wireframes | 10h |
| S2 — Carga de Contenido y Ajustes | Amelia, ajustes, tours | 10h |
| S3 — Desarrollo de Interfaz y Secciones | Home, secciones, diseño | 18h |
| S4 — Responsive y Ajustes | Responsive, QA | 5h |
| S5 — Capacitación, Entrega y Video | Tutoriales, entrega | 5h |

### 3.5 Salud del Proyecto (TripleAxisService)

```
Consumo%    = horasConsumidas / horasPresupuestadas = 98.25/48 = 204.69%
Progreso%   = 85% (estimado por avance de tareas)
Desviación  = consumo% - progreso% = 119.69 puntos
Estado      = CRITICAL (desviación > 30pp)
HealthScore = 12/100
```

---

## 4. Fuentes de Datos

### Actual: Importación CSV Manual

```
Comando: python manage.py load_csv_data
Fuentes: DA-Rentabilidad/RAW_DATA/
  ├── Date-Task-Desc.csv      (fecha, tarea Clockify, proyecto, descripción, horas, costo)
  └── Date-user-description.csv (fecha, usuario, descripción, horas, costo)

Merge key: (fecha, descripción) → registro completo con usuario + tarea
Resultado: 44 TimeEntries, 98.25h, $49,123 MXN
```

**Colaboradores detectados:**
| Nombre | Rol | Horas | Costo |
|--------|-----|-------|-------|
| Camila Veliz | Diseñadora UX/UI | 83.25h | $41,623 |
| Christian Luna | Project Manager | 12.00h | $6,000 |
| Rafael Castillo López | Project Manager | 3.00h | $1,500 |

### Futuro: APIs Automáticas

| API | Datos | Modelo destino | Estado |
|-----|-------|----------------|--------|
| **Clockify** | Horas, costo, usuario, fecha, descripción | TimeEntry | Scaffolded (apps/integrations/) |
| **Jira** | Tickets, story points, progreso, sprints | SprintTask, Sprint | Scaffolded |
| **Zoho Books** | Facturas, pagos, estados, fechas | Phase.invoice_amount, is_paid, invoice_date | Pendiente |

---

## 5. Changelog — Sesión 2026-02-18

### Data & Backend
- **Raw CSV merge:** Reemplazado distribución artificial de horas por datos reales diarios de Clockify
- **3 colaboradores:** Agregado Rafael Castillo López (3h PM) detectado en merge de CSVs
- **5 fases = 5 sprints:** Reestructurado de 6 fases independientes a 5 con mapeo 1:1
- **Horas redistribuidas:** S1 = 10h (antes 20h), S3 = 18h (antes 8h), total = 48h
- **CAP-17 → Reuniones:** Renombrado y asociado a gestión de proyecto
- **Invoice data:** S1 pagada ($12,000, 18 ene), S2-S5 pendientes

### Frontend — KPI Strip (nuevo)
- 4 métricas financieras arriba de las gráficas: Cotización, Cobrado, Costo Real, Horas
- Colores condicionales: rojo si costo > cotización o horas > presupuesto

### Frontend — ProjectPhasesCard (rediseño)
- **Color = facturación:** verde (pagada), ámbar (pendiente), gris (sin trabajo)
- **Iconos = facturación:** CheckCircle2 (pagada), Circle (pendiente)
- **Comparación financiera:** costo real vs cotizado por etapa (ej: $26.5k / $12.0k)
- **Tasa horaria efectiva** derivada de datos del proyecto
- **Eliminada sección de Facturación** redundante del bottom de la tarjeta

### Frontend — ProjectJitterChart (limpieza)
- **Eliminados 3 KPIs** redundantes (Total Registros, Total Horas, Promedio)
- **Chart más alto:** 280px → 320px aprovechando espacio liberado
- **Leyenda compacta:** solo color + nombre sprint (sin horas/registros/meses)
- **Colores S5:** púrpura → gris para evitar confusión con S1 azul

---

## 6. Visión de Integración (Roadmap)

### Fase 1 — MVP Manual (ACTUAL)
- [x] Carga de datos via CSV de Clockify
- [x] Dashboard con KPIs, etapas, distribución de horas, sprints
- [x] Gestión de avances y cambios por sprint
- [x] Multi-tenant con roles (PM, Director, Admin, Cliente)
- [ ] Carga manual de datos para más proyectos

### Fase 2 — Sync Semi-automático
- [ ] Clockify API: sync de time entries por proyecto (Celery task)
- [ ] Jira API: sync de tickets y sprints
- [ ] Botón "Sincronizar" en dashboard (ya existe endpoint `/api/v1/integrations/sync/trigger/`)
- [ ] Mapeo automático tarea→fase basado en tags Jira

### Fase 3 — Facturación Automática
- [ ] Zoho Books API: sync de facturas y pagos
- [ ] Actualización automática de is_paid, invoice_date, invoice_amount
- [ ] Alertas automáticas de cobro próximo
- [ ] Dashboard de facturación global (todos los proyectos)

### Fase 4 — Inteligencia y Predicción
- [ ] Cálculo de margen real por proyecto/etapa/equipo
- [ ] Predicción de sobrecosto basada en velocidad de consumo
- [ ] Detección automática de bloqueos (sin actividad > X días)
- [ ] Benchmarks entre proyectos del mismo tipo
- [ ] Reportes PDF/Excel automatizados con datos en vivo

---

## 7. Decisiones de Arquitectura para Escalabilidad

### ¿Por qué el modelo actual es escalable?

1. **TimeEntry.clockify_id** — Campo único que permite idempotencia en sync. Al integrar Clockify API, los registros existentes se actualizan en vez de duplicarse.

2. **Phase ↔ Sprint 1:1** — Cada fase del proyecto corresponde a un sprint, simplificando la trazabilidad hora→fase→sprint→entregable.

3. **TripleAxisService** — Lógica de salud centralizada en un servicio. Al cambiar la fuente de datos (CSV→API), el cálculo de salud no cambia.

4. **Celery + Redis** — Infraestructura de tareas asíncronas ya configurada. Las sincronizaciones con APIs serán Celery tasks periódicas.

5. **Multi-tenant desde el día 1** — Permisos y filtrado por organización/rol ya implementados. Agregar clientes o equipos es plug-and-play.

6. **Serializers con campos computados** — `actual_hours` en PhaseSerializer se computa de TimeEntry. Al agregar más time entries (via API), los cálculos se actualizan automáticamente.

7. **Frontend desacoplado** — React Query + Zod schemas validan todo dato del API. Cambiar el backend de CSV→API no requiere cambios en frontend.

---

## 8. Definiciones de Negocio (Minuta 2026-02-18)

### 8.1 Tasa Horaria y Roles

**Decisión:** Se mantiene tarifa única de **$500 MXN/hr** para todos los roles (Diseñador UX/UI, Project Manager).

**Contexto:** La posibilidad de integrar tarifas diferenciadas por rol se evaluará en una etapa de consultoría posterior. El modelo `ProjectRoleRate` ya soporta tarifas por rol por proyecto, pero no se activa hasta que el negocio lo requiera.

**Implicación técnica:** El cálculo actual `project.actualCost / project.consumedHours` es suficiente. Cuando se diferencien tarifas, el costo real vendrá directamente de `TimeEntry.cost` (ya existe el campo), eliminando la necesidad de derivar la tasa.

### 8.2 Facturado vs. Cobrado

**Decisión:** Se requiere distinguir entre **facturado** (emisión del documento legal) y **cobrado** (recepción efectiva del pago). Análisis pendiente para implementar.

**Proceso actual de CAP-MX:**
1. Factura de **anticipo** al inicio del proyecto
2. **4 facturas** adicionales conforme se completan las etapas durante el desarrollo
3. Total: 5 facturas alineadas con los 5 sprints

**Pendiente técnico:** Agregar campo `is_invoiced` (bool) al modelo Phase, separado de `is_paid`. Esto permite 3 estados:
- `is_invoiced=false, is_paid=false` → Pendiente
- `is_invoiced=true, is_paid=false` → Facturada (emitida, no cobrada)
- `is_invoiced=true, is_paid=true` → Cobrada

**Nota:** Este cambio se integrará con Zoho Books API en Fase 3 del roadmap.

### 8.3 Desglose de Costos por Rol

**Decisión:** No se implementa desglose por rol en esta fase. Todos los roles operan a $500/hr, por lo que el desglose no aporta información adicional actualmente.

**Futuro:** Cuando las tarifas sean diferenciadas, se habilitará un desglose de costo por perfil dentro de cada etapa, usando los campos existentes `TimeEntry.user_email` + `ProjectRoleRate.hourly_rate`.

### 8.4 Sprint 5 — Placeholder Estratégico

**Decisión:** Sprint 5 (Capacitación, Entrega y Video) es un **placeholder planificado**, no un residuo.

**Regla de negocio:** La estructura estándar para proyectos de diseño es de **5 sprints**. Aunque algunos proyectos pueden cerrar en 4 etapas, el sprint de cierre y capacitación está contemplado en la planificación. Se activará con sus registros de tiempo cuando el cronograma alcance esa fase.

**Implicación:** El estado "pending" con 0h es correcto y esperado. No debe generar alertas ni indicadores negativos.

### 8.5 Riesgo: Dependencia de Estructura de Datos Clockify (CSV)

**Problema identificado:** La carga actual requiere dos exportaciones CSV con filtros distintos:
- `Date-Task-Desc.csv` — orientado a tareas (fecha, tarea, descripción, horas)
- `Date-user-description.csv` — orientado a usuarios (fecha, usuario, descripción, horas)

La consolidación se realiza via merge con llave `(fecha, descripción)`. Este proceso es **frágil**: cualquier inconsistencia en la descripción de las tareas (espacios, mayúsculas, caracteres especiales) rompe la relación de datos.

**Impacto:** Este es un riesgo operativo para cargas manuales. Si un usuario escribe "Estructura web" en una entrada y "Estructura Web" en otra, el merge falla silenciosamente y se pierden datos de usuario o tarea.

**Solución en Fase 2 (API):** La API REST de Clockify (`GET /workspaces/{id}/time-entries/`) retorna **todos los campos en un solo registro**:
```json
{
  "description": "Estructura Web",
  "timeInterval": { "start": "2026-01-05T09:00:00Z", "duration": "PT5H3M" },
  "userId": "...",
  "projectId": "...",
  "taskId": "..."
}
```
Esto elimina completamente la necesidad del merge por (fecha, descripción), ya que cada time entry viene con su usuario, proyecto y tarea asociados en un solo objeto. La migración a API no solo automatiza el proceso, sino que **elimina el punto de fragilidad** del modelo actual.

**Mientras tanto (Fase 1):** Se recomienda validar manualmente que las descripciones coincidan entre ambos CSVs antes de ejecutar `load_csv_data`. El comando actual logea warnings cuando un registro no encuentra match en el merge.
