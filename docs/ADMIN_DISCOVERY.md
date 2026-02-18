# Discovery: Admin Section - Project Management & Profitability

> **Objetivo:** Construir la sección de administración que permita al Project Manager
> monitorear el progreso, rentabilidad y eficiencia de cada proyecto en tiempo real.

---

## 1. Contexto Actual del Sistema

### Modelos existentes
| Modelo | Propósito | Campos clave |
|--------|-----------|--------------|
| `Project` | Proyecto base | budget_hours, client_invoice_amount, target_margin |
| `Phase` | Fases del proyecto | estimated_hours, sort_order |
| `BillingRole` | Roles facturables globales | role_name, default_hourly_rate |
| `ProjectRoleRate` | Tarifa por rol por proyecto | hourly_rate (override) |
| `TimeEntry` | Horas sincronizadas de Clockify | duration_hours, cost, date, user_name |
| `HealthSnapshot` | Historial de salud Triple Axis | consumption_%, progress_%, earned_value |

### Integraciones existentes
- **Clockify:** Sincroniza time entries (horas reales trabajadas)
- **Jira:** Calcula progreso por story points (done / total)

### Lógica existente (TripleAxisService)
- Consumo% = horas_consumidas / horas_presupuestadas
- Valor Ganado = invoice_amount * progreso%
- Salud: CRITICAL / WARNING / HEALTHY basado en desviación consumo vs progreso

---

## 2. Lo que Necesitamos Construir

### 2.1 Detección de Progreso y Atrasos
- **Vista por proyecto:** Progreso real vs progreso esperado (basado en timeline)
- **Identificar responsable del atraso:**
  - Bloqueo interno (nuestro equipo no avanza)
  - Bloqueo externo (cliente no entrega recursos/contenido/feedback)
- **Días de bloqueo:** Medir cuánto tiempo estuvo detenido y por quién

### 2.2 KPIs Requeridos
| KPI | Fórmula | Propósito |
|-----|---------|-----------|
| **Eficiencia** | horas_estimadas / horas_reales | >1 = eficiente, <1 = ineficiente |
| **Productividad** | story_points_completados / horas_trabajadas | Output por hora |
| **Rentabilidad** | (ingreso - costo_real) / ingreso * 100 | Margen real del proyecto |
| **Desviación de Presupuesto** | (costo_real - costo_estimado) / costo_estimado * 100 | Sobrecosto |
| **Rentabilidad por Etapa** | (ingreso_etapa - costo_etapa) / ingreso_etapa * 100 | Qué etapas pierden dinero |
| **Proximidad de Facturación** | días_para_próximo_hito_de_pago | Alertar fechas de cobro |

### 2.3 Control de Rentabilidad por Etapa
**Concepto clave:** Si la etapa X tiene un precio de $5,000 y una duración estimada de 10 días:
- Si tarda 10 días → rentable (costo = horas * tarifa_interna <= $5,000)
- Si tarda 15 días → estamos perdiendo dinero
- Si el cliente pide cambios simples que alargan la etapa → pérdida no detectada

**Necesitamos:**
- Precio asignado por etapa (no solo horas estimadas)
- Costo real por etapa (sum de time_entries * costo/hora interno)
- Comparación automática: precio_etapa vs costo_real_etapa

---

## 3. Preguntas Pendientes (Requieren Respuesta del Equipo)

### 3.1 Estructura de Equipos

> **Contexto:** Existen dos equipos principales: **Diseño** y **Sistemas**.
> El equipo administrativo ha crecido.

- [ ] **P1:** ¿Los costos operativos (admin, herramientas, oficina) se distribuyen globalmente entre todos los proyectos, o cada equipo (Diseño vs Sistemas) tiene sus propios costos operativos?
- [ ] **P2:** ¿Cuáles son los costos internos actuales? (ej: salarios, herramientas, etc.)
- [ ] **P3:** ¿Cuántas personas hay en cada equipo actualmente?

### 3.2 Modelo de Pricing

> **Contexto:** Diseño tiene pricing más predecible (alcances similares).
> Sistemas cotiza a detalle con pricing personalizado.
> A veces una diseñadora de frontend hace trabajo para Sistemas, cobrado por horas como "extra".

- [ ] **P4:** Para proyectos de **Diseño**, ¿se cobra precio fijo por proyecto o tienen paquetes/plantillas de pricing? (ej: "Branding básico = $X", "Branding completo = $Y")
- [ ] **P5:** Para proyectos de **Sistemas**, ¿se cotiza con un desglose por etapa? (ej: Discovery=$X, Diseño=$X, Desarrollo=$X, QA=$X)
- [ ] **P6:** Cuando una diseñadora de frontend apoya a Sistemas, ¿cómo se registra hoy ese "extra"? ¿Se suma al proyecto de Sistemas o se factura por separado?
- [ ] **P7:** ¿Hay proyectos de mantenimiento o retainer (horas mensuales)? ¿Cómo se cobran?

### 3.3 Modelo de Facturación

- [ ] **P8:** ¿Cuál es el esquema de pago más común? Ejemplos:
  - a) Anticipo + entrega final (50/50)
  - b) Por hitos/etapas (30% inicio, 40% mitad, 30% entrega)
  - c) Mensual
  - d) Varía por proyecto
- [ ] **P9:** ¿Necesitan registrar fechas de facturación por cada hito? (para la alerta "el cliente está cerca del próximo pago")
- [ ] **P10:** ¿Actualmente cómo rastrean si un cliente ya pagó o tiene facturas pendientes?

### 3.4 Tipos de Proyecto

- [ ] **P11:** ¿Cuáles son los tipos de proyecto actuales? Ejemplos:
  - **Diseño:** Branding, UI/UX, Landing Page, Identidad Visual, etc.
  - **Sistemas:** App Web, App Móvil, E-commerce, Dashboard, API, etc.
- [ ] **P12:** ¿Cada tipo tiene etapas predefinidas? (ej: un proyecto de Branding SIEMPRE pasa por: Brief > Research > Conceptualización > Diseño > Entrega)
- [ ] **P13:** ¿Hay plantillas de duración estimada por tipo? (ej: un Branding básico debería tomar ~15 días)

### 3.5 Registro de Horas y Progreso

> **Contexto:** Las horas internas se registran en Clockify.
> Las horas de proyectos se registran en Jira.
> No está claro cómo se mapean las etapas.

**Datos observados en Clockify (screenshot):**
| Entrada | Horas |
|---------|-------|
| Alejandro Alvarez | 72:00:47 |
| Appix TI | 45:01:20 |
| EENVITA | 08:57:34 |
| ENV-47 | 01:27:07 |
| ENV-49 | 07:30:27 |

- [ ] **P14:** "Alejandro Alvarez" aparece como nombre de proyecto en Clockify. ¿Esto son horas internas asignadas a una persona? ¿O es un proyecto del cliente "Alejandro Alvarez"?
- [ ] **P15:** "ENV-47" y "ENV-49" parecen ser IDs de tickets de Jira. ¿Se registran horas en Clockify con el ID del ticket de Jira como nombre?
- [ ] **P16:** "Appix TI" parece ser un proyecto interno. ¿Cómo distinguen entre proyectos facturables y proyectos internos?
- [ ] **P17:** En Jira, ¿los tickets están organizados por etapa/fase del proyecto? (ej: Epic = Fase, Story = Tarea dentro de la fase)
- [ ] **P18:** ¿Se registran horas (time tracking) directamente en los tickets de Jira? ¿O solo se usa Clockify para eso?

### 3.6 Bloqueos y Responsabilidades

- [ ] **P19:** ¿Actualmente marcan en algún lugar cuando un proyecto está bloqueado por el cliente? (ej: un status en Jira, un tag, un comentario)
- [ ] **P20:** ¿Qué tipos de bloqueo son más comunes?
  - a) Cliente no entrega contenido/assets
  - b) Cliente no da feedback/aprobación
  - c) Cambio de alcance por parte del cliente
  - d) Falta de recursos internos
  - e) Dependencia técnica
- [ ] **P21:** ¿Quieren medir el impacto en dinero de los bloqueos? (ej: "este proyecto perdió $X por 5 días de bloqueo del cliente")

---

## 4. Propuesta de Modelo de Datos (Preliminar)

> **Nota:** Este modelo se refinará después de responder las preguntas anteriores.

### Nuevos modelos necesarios:

```
Team                    → Equipo (Diseño, Sistemas)
ProjectType             → Tipo de proyecto (Branding, App Web, etc.)
ProjectTypeTemplate     → Plantilla de fases y duración por tipo
PhasePrice              → Precio asignado por fase del proyecto
BillingMilestone        → Hitos de facturación con fechas y montos
ProjectBlocker          → Registro de bloqueos (tipo, responsable, duración)
OperationalCost         → Costos operativos (globales o por equipo)
TeamMember              → Miembros del equipo con costo/hora interno
```

### Campos nuevos en modelos existentes:

```python
# Project (ampliar)
+ team                  → FK a Team
+ project_type          → FK a ProjectType
+ start_date            → Fecha de inicio real
+ expected_end_date     → Fecha estimada de entrega
+ actual_end_date       → Fecha real de entrega (null si en progreso)
+ status                → DRAFT / ACTIVE / BLOCKED / COMPLETED / CANCELLED

# Phase (ampliar)
+ price                 → Precio asignado a esta fase
+ estimated_days        → Días estimados (no solo horas)
+ start_date            → Fecha inicio real de la fase
+ end_date              → Fecha fin real (null si en progreso)
+ status                → NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETED
+ blocker_type          → INTERNAL / CLIENT / NONE
```

---

## 5. KPIs y Cálculos Propuestos

### Por Proyecto
```
Rentabilidad Real    = (client_invoice - costo_real) / client_invoice * 100
Eficiencia           = horas_estimadas / horas_reales
Días de Desviación   = días_reales - días_estimados
Costo por Día Real   = costo_real / días_trabajados
Ingreso por Día      = client_invoice / días_totales
```

### Por Etapa
```
Rentabilidad Etapa   = (precio_etapa - costo_real_etapa) / precio_etapa * 100
Sobre-tiempo         = horas_reales_etapa - horas_estimadas_etapa
Costo del Sobre-tiempo = sobre_tiempo * tarifa_promedio_equipo
```

### Por Equipo
```
Rentabilidad Equipo   = sum(rentabilidad proyectos del equipo) / count
Utilización           = horas_facturables / horas_disponibles * 100
Proyectos en Riesgo   = count(proyectos con rentabilidad < target_margin)
```

### Facturación
```
Próximo Cobro         = próximo BillingMilestone no pagado
Días para Cobro       = milestone.due_date - hoy
Facturación Pendiente = sum(milestones no pagados)
```

---

## 6. Próximos Pasos

1. **Responder preguntas P1-P21** con el equipo administrativo
2. **Definir tipos de proyecto** y sus plantillas de etapas
3. **Mapear datos reales** de Clockify y Jira para entender la estructura actual
4. **Refinar modelo de datos** basado en las respuestas
5. **Diseñar wireframes** de la sección admin en Figma
6. **Implementar backend** (modelos, servicios, API)
7. **Implementar frontend** (dashboard admin)
