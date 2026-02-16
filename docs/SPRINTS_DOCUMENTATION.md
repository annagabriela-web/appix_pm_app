# Documentacion de Sprints
## Plataforma de Gestion de Proyectos - Appix

---

### Informacion General del Proyecto

| Campo | Detalle |
|-------|---------|
| **Proyecto** | Plataforma Estrategica de Gestion de Proyectos |
| **Cliente** | Appix (interno + clientes externos) |
| **Producto** | Dashboard Admin (Tenant Interno) + Portal Cliente (Tenant Externo) |
| **Fecha de inicio** | 10 de febrero 2026 |
| **Fecha Release 1 (Admin)** | 15 de junio 2026 |
| **Fecha Release 2 (Cliente)** | 22 de agosto 2026 |
| **Duracion total** | 28 semanas (~7 meses) |
| **Metodologia** | Scrum |
| **Duracion de sprint** | 2 semanas |
| **Total de sprints** | 14 (9 Release 1 + 5 Release 2) |
| **Equipo estimado** | 1 Backend Dev, 1 Frontend Dev, 1 QA (minimo) |

### Vision del Producto

> Plataforma estrategica que centraliza la comunicacion, el control operativo y la salud financiera
> de los servicios de Appix. Actua como puente de transparencia entre la agencia y el cliente,
> permitiendo que ambas partes tomen decisiones basadas en datos en tiempo real.

**Metricas de exito:**
- **80%** de satisfaccion del cliente mediante transparencia
- **100%** de proyectos mantengan su margen de rentabilidad operativa

### Estructura Multi-Tenant

| Tenant | Audiencia | Proposito | Release |
|--------|-----------|-----------|---------|
| **Administrativo** | PMs, Directores, equipo Appix | Salvaguardar rentabilidad y eficiencia operativa | R1 (Jun 2026) |
| **Cliente** | Clientes externos de Appix | Fomentar confianza y corresponsabilidad en el exito | R2 (Ago 2026) |

### Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Backend | Django 5.0 + Django REST Framework |
| Task Queue | Celery 5.4 + Redis 7 |
| Base de Datos | PostgreSQL 16 |
| Frontend | Astro 4.0 + React 18 |
| Graficas | Recharts 2.13 |
| Estado del cliente | TanStack Query 5 |
| Validacion | Zod 3.23 |
| Estilos | Tailwind CSS 3 |
| Reportes | WeasyPrint (PDF) + OpenPyXL (Excel) |
| Infraestructura | Docker Compose (6 servicios) |
| Autenticacion | Django Session Auth |

### User Stories

#### Release 1: Dashboard Administrativo

| ID | Titulo | Epic | Sprint |
|----|--------|------|--------|
| US-01 | Sincronizacion con Clockify API cada hora | Data Integration | Sprint 3 |
| US-02 | Match de proyectos Jira-Clockify por ID o Fuzzy Matching | Data Integration | Sprint 3 |
| US-03 | Configuracion de tarifas por hora por Rol (global y por proyecto) | Data Integration | Sprint 6 |
| US-04 | Grafica Financial Burndown (Budget vs Actual Cost vs Earned Value) | Visualization | Sprint 6 |
| US-05 | Vista de Portfolio con semaforos (Rojo/Amarillo/Verde) | Visualization | Sprint 6 |
| US-06 | Grafica de barras Estimado vs Actual por Fase | Visualization | Sprint 6 |
| US-07 | Notificacion in-app inmediata al entrar en estado Critical | Reporting & Alerts | Sprint 6 |
| US-08 | Exportar reporte PDF con Resumen Ejecutivo y Graficas de Varianza | Reporting & Alerts | Sprint 7 |

#### Release 2: Portal de Cliente + Gestion de Cambios

| ID | Titulo | Epic | Sprint |
|----|--------|------|--------|
| US-09 | Sistema de roles multi-tenant (Admin/PM/Director vs Cliente) | Multi-Tenant | Sprint 10 |
| US-10 | Aislamiento de datos por Organization (tenant) | Multi-Tenant | Sprint 10 |
| US-11 | Flujo de Solicitudes de Cambio de Alcance (DRAFT -> APPROVED) | Change Management | Sprint 11 |
| US-12 | Ajuste automatico de presupuesto al aprobar un cambio de alcance | Change Management | Sprint 11 |
| US-13 | Visibilidad de fases y progreso porcentual para el cliente | Client Portal | Sprint 12 |
| US-14 | Gestion de cobranza: hitos de pago y estado de facturacion | Client Portal | Sprint 12 |
| US-15 | Gestion de requerimientos pendientes del cliente | Client Portal | Sprint 13 |
| US-16 | Sistema de notificaciones unificado (in-app para admin y cliente) | Client Portal | Sprint 13 |

---

## Mapa de Fases a Sprints

```
RELEASE 1 - DASHBOARD ADMINISTRATIVO
─────────────────────────────────────
FASE 0:  Infraestructura ──────────────────────> Sprint 1
FASE 1:  Modelos + Logica de Negocio ─────────> Sprint 2
FASE 2:  Integraciones (Clockify + Jira) ─────> Sprint 3
FASE 3:  API REST ─────────────────────────────> Sprint 4
FASE 4:  Frontend - Tipos, Servicios, Hooks ──> Sprint 5
FASE 5:  Frontend - Componentes Visuales ─────> Sprint 6
FASE 6:  Frontend - Paginas Astro ────────┐
FASE 7:  Reportes PDF/Excel ─────────────┴───> Sprint 7
         QA & Integracion E2E ────────────────> Sprint 8
         UAT & Deploy Release 1 ─────────────> Sprint 9
                                                  |> 15 Jun 2026

RELEASE 2 - PORTAL DE CLIENTE
──────────────────────────────
FASE 8:  Multi-Tenant Auth & Modelos ─────────> Sprint 10
FASE 9:  Gestion de Cambios de Alcance ──────> Sprint 11
FASE 10: Portal Cliente - Fases & Cobranza ──> Sprint 12
FASE 11: Portal Cliente - Reqs & Notifs ─────> Sprint 13
         QA Integral, UAT & Deploy R2 ───────> Sprint 14
                                                  |> 22 Ago 2026
```

---

## Calendario Visual

```
RELEASE 1: DASHBOARD ADMINISTRATIVO
         FEBRERO           MARZO              ABRIL              MAYO               JUNIO
 S1  S2  S3  S4  │  S1  S2  S3  S4  │  S1  S2  S3  S4  │  S1  S2  S3  S4  │  S1  S2
 ────────────────┼──────────────────┼──────────────────┼──────────────────┼──────────
 [SPRINT 1 ]     │                  │                  │                  │
    Infraestruct.│                  │                  │                  │
                 │[SPRINT 2 ]      │                  │                  │
                 │ Modelos+Logica  │                  │                  │
                 │          [SPRINT 3 ]               │                  │
                 │           Integraciones            │                  │
                 │                  │[SPRINT 4 ]      │                  │
                 │                  │  API REST       │                  │
                 │                  │          [SPRINT 5 ]               │
                 │                  │          FE Datos│                  │
                 │                  │                  │[SPRINT 6 ]      │
                 │                  │                  │  Componentes    │
                 │                  │                  │          [SPRINT 7 ]
                 │                  │                  │          Pags+Rep│
                 │                  │                  │                  │[SPRINT 8]
                 │                  │                  │                  │  QA
                 │                  │                  │                  │    [SP 9]
                 │                  │                  │                  │  Deploy R1
                 │                  │                  │                  │     |>15 Jun

RELEASE 2: PORTAL DE CLIENTE
         JUNIO             JULIO              AGOSTO
 S3  S4  │  S1  S2  S3  S4  │  S1  S2  S3  S4
 ────────┼──────────────────┼──────────────────
 [SPRINT 10]                │
  Multi-Tenant              │
          [SPRINT 11]       │
           Change Requests  │
                  [SPRINT 12]
                  Portal Cli 1
                            │[SPRINT 13]
                            │ Portal Cli 2
                            │          [SPRINT 14]
                            │          Deploy R2
                            │               |>22 Ago
```

---
---

# SPRINT 1: Infraestructura & Scaffolding

| Campo | Detalle |
|-------|---------|
| **Sprint** | 1 de 14 |
| **Fase** | Fase 0 - Infraestructura |
| **Inicio** | 10 de febrero 2026 (lunes) |
| **Deadline** | 21 de febrero 2026 (viernes) |
| **Objetivo** | Monorepo funcional con Docker Compose levantando 6 servicios correctamente |
| **User Stories** | Ninguna (sprint de infraestructura) |

### Alcance

Este sprint establece la base tecnica completa del proyecto. Al finalizar, todo el equipo debe poder clonar el repositorio, ejecutar `docker-compose up` y tener el entorno de desarrollo funcional.

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 1.1 | Crear `docker-compose.yml` con 6 servicios: PostgreSQL 16, Redis 7, Django, Celery Worker, Celery Beat, Astro Dev | 4 | P0 | Backend |
| 1.2 | Crear `.env.example` con todas las variables de entorno y `.gitignore` completo | 1 | P0 | Backend |
| 1.3 | Backend: `Dockerfile` (Python 3.11-slim + deps WeasyPrint), `requirements.txt`, scaffolding Django | 4 | P0 | Backend |
| 1.4 | Backend: `core/settings.py` configurado con PostgreSQL, Celery, CORS, DRF, COERCE_DECIMAL_TO_STRING | 4 | P0 | Backend |
| 1.5 | Backend: `core/celery.py`, `core/urls.py`, `core/wsgi.py` | 2 | P0 | Backend |
| 1.6 | Frontend: `package.json` con dependencias, `Dockerfile` (Node 20), `astro.config.mjs`, `tsconfig.json` | 4 | P0 | Frontend |
| 1.7 | Frontend: `tailwind.config.mjs` con Design System tokens (critical, warning, healthy, neutral, primary, accent) | 2 | P0 | Frontend |
| 1.8 | Frontend: `src/styles/global.css` con Tailwind directives y clase `.financial-number` (tabular-nums) | 1 | P1 | Frontend |
| 1.9 | Verificacion: `docker-compose up` exitoso, 6 servicios healthy, Django admin y Astro accesibles | 2 | P0 | QA |
| 1.10 | Documentar instrucciones de setup en README | 2 | P2 | Backend |

**Total estimado: 26 horas**

### Archivos Entregables

```
raiz/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   └── core/
│       ├── __init__.py
│       ├── settings.py
│       ├── celery.py
│       ├── urls.py
│       └── wsgi.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── astro.config.mjs
    ├── tsconfig.json
    ├── tailwind.config.mjs
    └── src/
        ├── env.d.ts
        └── styles/
            └── global.css
```

### Criterios de Aceptacion (Definition of Done)

- [ ] `docker-compose up` levanta 6 servicios sin errores en logs
- [ ] PostgreSQL responde a healthcheck (`pg_isready`)
- [ ] Redis responde a healthcheck (`redis-cli ping`)
- [ ] Django accesible en `http://localhost:8001/admin/`
- [ ] Astro accesible en `http://localhost:4321/`
- [ ] Celery Worker reporta "ready" en logs
- [ ] Celery Beat reporta "ready" en logs
- [ ] `pip install -r requirements.txt` sin errores en container
- [ ] `npm install` sin errores en container frontend

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Conflictos de puertos con otros contenedores Docker | Alta | Medio | Usar puertos alternativos (5433, 6380, 8001) y documentar |
| Dependencias de sistema para WeasyPrint fallan en build | Media | Alto | Probar build de imagen aislada antes de docker-compose |
| Versiones incompatibles entre dependencias Python/Node | Baja | Alto | Fijar versiones exactas en requirements.txt y package.json |

### Notas Tecnicas

- **Puertos mapeados:** PostgreSQL 5433:5432, Redis 6380:6379, Django 8001:8000, Astro 4321:4321
- **WeasyPrint** requiere dependencias de sistema: `libcairo2-dev`, `libpango1.0-dev`, `libgdk-pixbuf-2.0-dev`, `libffi-dev`, `shared-mime-info`
- Django settings debe incluir `COERCE_DECIMAL_TO_STRING = True` en REST_FRAMEWORK config
- Celery Beat necesita que Django haya ejecutado migraciones antes de arrancar

---
---

# SPRINT 2: Modelos de Datos & Logica de Negocio

| Campo | Detalle |
|-------|---------|
| **Sprint** | 2 de 14 |
| **Fase** | Fase 1 - Modelos + Logica de Negocio |
| **Inicio** | 24 de febrero 2026 (lunes) |
| **Deadline** | 7 de marzo 2026 (viernes) |
| **Objetivo** | 7 modelos de datos migrados, servicio TripleAxisService funcional, 10+ tests unitarios pasando |
| **User Stories** | Ninguna directa (fundamento para US-01 a US-08) |

### Alcance

Este sprint construye el corazon del sistema: el modelo de datos financiero y la logica de negocio "Triple Axis Varianza" que determina la salud de cada proyecto. Es el sprint mas critico porque todas las fases posteriores dependen de estos modelos y calculos.

### Modelo de Datos (7 Entidades)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Project    │────<│    Phase      │     │   BillingRole    │
│─────────────│     │──────────────│     │──────────────────│
│ name         │     │ name         │     │ role_name        │
│ code         │     │ estimated_hrs│     │ default_hourly   │
│ client_name  │     │ FK project   │     │   _rate          │
│ budget_hours │     └──────────────┘     └──────────────────┘
│ client_inv.  │                                │
│ target_margin│     ┌──────────────────┐       │
│ jira_key     │────<│ ProjectRoleRate  │───────┘
│ clockify_id  │     │──────────────────│
│ health_status│     │ hourly_rate      │
└─────────────┘     │ FK project       │
       │             │ FK billing_role  │
       │             └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │   TimeEntry       │
       │     │──────────────────│
       │     │ clockify_id (UK) │
       │     │ user_name        │
       │     │ duration_hours   │
       │     │ cost             │
       │     │ date             │
       │     │ FK project       │
       │     │ FK phase         │
       │     │ FK billing_role  │
       │     └──────────────────┘
       │
       ├────<┌──────────────────┐
       │     │ HealthSnapshot    │
       │     │──────────────────│
       │     │ timestamp        │
       │     │ consumption_pct  │
       │     │ progress_pct     │
       │     │ budget_consumed  │
       │     │ earned_value     │
       │     │ health_status    │
       │     │ health_score     │
       │     └──────────────────┘
       │
       └────<┌──────────────────┐
             │ProjectHealthAlert│
             │──────────────────│
             │ alert_type       │
             │ message          │
             │ is_read          │
             │ created_at       │
             └──────────────────┘
```

### Logica Triple Axis Varianza

```
                    ┌─────────────────────────────────────────┐
                    │         TRIPLE AXIS VARIANZA            │
                    │                                         │
                    │  Eje 1: Consumo = horas_usadas          │
                    │                   ─────────── x 100     │
                    │                   horas_presup.         │
                    │                                         │
                    │  Eje 2: Progreso = story_points_done    │
                    │                    ─────────────── x100 │
                    │                    story_points_total   │
                    │                                         │
                    │  Eje 3: Desviacion = |Consumo-Progreso| │
                    └────────────────┬────────────────────────┘
                                     │
                    ┌────────────────┴────────────────────┐
                    │          REGLAS DE EVALUACION        │
                    │                                     │
                    │  CRITICAL (Rojo):                   │
                    │    Consumo >= 80% AND Progreso < 50%│
                    │    Score: 0-33                      │
                    │                                     │
                    │  WARNING (Amarillo):                │
                    │    Desviacion > 15%                 │
                    │    Score: 34-66                     │
                    │                                     │
                    │  HEALTHY (Verde):                   │
                    │    Desviacion <= 10%                │
                    │    Score: 67-100                    │
                    └─────────────────────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 2.1 | Crear app `finance`: 7 modelos con campos Decimal, indices, constraints | 6 | P0 | Backend |
| 2.2 | Generar y ejecutar migraciones en PostgreSQL | 2 | P0 | Backend |
| 2.3 | Implementar `TripleAxisService` con 6 metodos estaticos | 6 | P0 | Backend |
| 2.4 | Configurar Django Admin: semaforos de color, inlines Phase y ProjectRoleRate | 4 | P1 | Backend |
| 2.5 | Test: escenario Gherkin del PRD (85h consumidas / 200h budget / 40% progreso -> CRITICAL) | 4 | P0 | Backend |
| 2.6 | Tests edge cases: 0 horas, division por cero, limites exactos de umbrales | 3 | P0 | Backend |
| 2.7 | Scaffolding app `integrations` con modelo SyncLog | 2 | P1 | Backend |
| 2.8 | Scaffolding app `reports` con estructura basica | 1 | P2 | Backend |
| 2.9 | Crear proyecto de prueba via Admin con datos seed | 1 | P1 | QA |

**Total estimado: 29 horas**

### Archivos Entregables

```
backend/apps/
├── finance/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py          ← 7 modelos
│   ├── services.py        ← TripleAxisService
│   ├── admin.py           ← Admin con semaforos
│   ├── migrations/
│   │   └── 0001_initial.py
│   └── tests/
│       ├── __init__.py
│       └── test_services.py  ← 10+ tests
├── integrations/
│   ├── __init__.py
│   ├── apps.py
│   └── models.py          ← SyncLog
└── reports/
    ├── __init__.py
    └── apps.py
```

### Criterios de Aceptacion (Definition of Done)

- [ ] 7 modelos migrados correctamente en PostgreSQL (verificar con `\dt` en psql)
- [ ] Todos los campos financieros son `DecimalField` (nunca `FloatField`)
- [ ] Indices creados en `(project, date)` para TimeEntry y `(project, timestamp)` para HealthSnapshot
- [ ] `TripleAxisService.evaluate_health(85, 40)` retorna `("CRITICAL", score <= 33)`
- [ ] `TripleAxisService.evaluate_health(50, 45)` retorna `("HEALTHY", score >= 67)`
- [ ] `TripleAxisService.evaluate_health(60, 40)` retorna `("WARNING", 34 <= score <= 66)`
- [ ] Division por cero manejada (proyecto con 0 budget_hours)
- [ ] `run_evaluation()` crea HealthSnapshot y genera alerta solo en CAMBIO de estado
- [ ] 10+ tests unitarios pasando con `pytest`
- [ ] Django Admin muestra proyectos con badge de color segun health_status

### Escenario Gherkin de Referencia

```gherkin
Scenario: Deteccion de proyecto critico
  Given un proyecto "App Mobile Vivo" con budget de 200 horas
  And se han consumido 170 horas (85% de consumo)
  And el progreso en Jira es 40%
  When el sistema evalua la salud del proyecto
  Then el status debe ser "CRITICAL"
  And se genera una alerta de tipo "critical"
  And el health_score debe ser menor a 34
```

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Precision de Decimal insuficiente en calculos | Media | Alto | Usar `max_digits=10, decimal_places=2` minimo |
| Umbrales de logica ambiguos en zona gris (50-65%) | Media | Medio | Documentar reglas exactas, crear tests para cada limite |
| Alertas duplicadas por evaluaciones repetidas | Alta | Medio | Comparar con ultimo HealthSnapshot antes de generar alerta |

---
---

# SPRINT 3: Integraciones Clockify & Jira

| Campo | Detalle |
|-------|---------|
| **Sprint** | 3 de 14 |
| **Fase** | Fase 2 - Integraciones |
| **Inicio** | 10 de marzo 2026 (lunes) |
| **Deadline** | 21 de marzo 2026 (viernes) |
| **Objetivo** | Sincronizacion automatica funcional con Clockify y Jira; evaluacion de salud periodica via Celery Beat |
| **User Stories** | US-01 (Clockify Sync), US-02 (Jira-Clockify Match) |

### Alcance

Este sprint conecta el sistema con las fuentes de datos externas. Al finalizar, los time entries de Clockify se sincronizan automaticamente, el progreso de Jira se consulta cada hora, y la evaluacion de salud se ejecuta cada 10 minutos despues de las sincronizaciones.

### Arquitectura de Integracion

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐
│ Clockify API │     │   Jira API   │     │     Celery Beat          │
│  (externo)   │     │  (externo)   │     │   (Scheduler)            │
└──────┬───────┘     └──────┬───────┘     │                          │
       │                     │             │  :00 sync_clockify       │
       v                     v             │  :05 sync_jira           │
┌──────────────┐     ┌──────────────┐     │  :10 evaluate_health     │
│ ClockifyClient│    │  JiraClient  │     └──────────┬───────────────┘
│  (HTTP)      │     │  (HTTP)      │                │
└──────┬───────┘     └──────┬───────┘                │
       │                     │                        │
       v                     v                        v
┌──────────────────────────────────────────────────────┐
│              ClockifySyncService                      │
│  - upsert TimeEntries (por clockify_id unico)        │
│  - mapear Tags -> Phases                             │
│  - calcular costo = duration * hourly_rate           │
│  - ProjectRoleRate override > BillingRole default    │
└──────────────────────────────────────────────────────┘
       │                     │                        │
       v                     v                        v
┌──────────┐      ┌──────────────┐      ┌────────────────┐
│TimeEntry │      │HealthSnapshot│      │ProjectHealth   │
│ (upsert) │      │  (nuevo)     │      │  Alert (si     │
│          │      │              │      │  cambio status)│
└──────────┘      └──────────────┘      └────────────────┘
```

### Celery Beat Schedule

| Tarea | Frecuencia | Minuto | Descripcion |
|-------|-----------|--------|-------------|
| `sync_clockify_time_entries` | Cada hora | :00 | Fetch y upsert de time entries |
| `sync_jira_progress` | Cada hora | :05 | Fetch de progreso por story points |
| `evaluate_all_projects_health` | Cada hora | :10 | Recalcular salud de todos los proyectos |

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 3.1 | `ClockifyClient`: fetch_projects, fetch_time_entries, fetch_users con paginacion automatica | 6 | P0 | Backend |
| 3.2 | `ClockifySyncService`: upsert por clockify_id, mapeo Tags->Phases, calculo de costos con override | 6 | P0 | Backend |
| 3.3 | `JiraClient`: fetch_project_progress (story points done/total -> Decimal %) | 4 | P0 | Backend |
| 3.4 | 3 tareas Celery con schedule en Beat: sync_clockify, sync_jira, evaluate_health | 4 | P0 | Backend |
| 3.5 | Endpoint POST `/api/v1/integrations/sync/trigger/` (sync manual) + GET `/sync/status/` | 3 | P1 | Backend |
| 3.6 | Tests con mocks de Clockify API (responses o unittest.mock) | 4 | P0 | Backend |
| 3.7 | Test de upsert: no duplicar TimeEntries con mismo clockify_id | 2 | P0 | Backend |
| 3.8 | Test de calculo de costo: ProjectRoleRate override vs BillingRole default | 2 | P1 | Backend |
| 3.9 | Verificar Celery Beat ejecuta las 3 tareas en el schedule correcto | 2 | P1 | QA |

**Total estimado: 33 horas**

### Archivos Entregables

```
backend/apps/integrations/
├── __init__.py
├── apps.py
├── models.py               ← SyncLog (ya existe de Sprint 2)
├── clockify_client.py      ← Cliente HTTP Clockify
├── clockify_sync_service.py ← Logica de sync y upsert
├── jira_client.py          ← Cliente HTTP Jira
├── tasks.py                ← 3 tareas Celery
├── views.py                ← Sync manual + status
├── urls.py                 ← Rutas
└── tests/
    ├── __init__.py
    ├── test_clockify_sync.py
    └── test_jira_client.py
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-01:** Clockify sync crea TimeEntries con costos correctos (duration * hourly_rate)
- [ ] **US-02:** Jira client retorna progreso como porcentaje Decimal (0.00 a 100.00)
- [ ] Upsert no duplica TimeEntries: segunda ejecucion con mismos datos no crea registros nuevos
- [ ] Calculo de costo usa ProjectRoleRate si existe, sino BillingRole.default_hourly_rate
- [ ] Tags de Clockify se mapean correctamente a Phases del proyecto
- [ ] `evaluate_all_projects_health` crea HealthSnapshot y actualiza `Project.current_health_status`
- [ ] Alertas solo se generan cuando el status CAMBIA (no en cada evaluacion)
- [ ] SyncLog registra cada sync: tipo, status (success/error), entries_synced, error_message
- [ ] Celery Beat ejecuta tareas segun schedule (:00, :05, :10)
- [ ] POST sync manual dispara sincronizacion exitosamente

### Dependencias Externas (BLOQUEANTES)

| Dependencia | Estado | Responsable | Fecha limite |
|-------------|--------|-------------|-------------|
| API Key de Clockify (workspace) | Pendiente | Admin Clockify | 10 Mar 2026 |
| API Token de Jira (proyecto) | Pendiente | Admin Jira | 10 Mar 2026 |

> **IMPORTANTE:** Sin estas credenciales, solo se puede desarrollar con mocks. La integracion real se valida al final del sprint.

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| API keys no disponibles al inicio del sprint | Alta | Alto | Desarrollar 100% con mocks, validar real al final |
| Rate limiting de APIs externas | Media | Medio | Implementar backoff exponencial y cache |
| Mapeo incorrecto Tags->Phases | Alta | Medio | Log de tags no mapeados, alerta al admin |
| Clockify API cambia schema | Baja | Alto | Versionar URL de API, validar respuestas |

---
---

# SPRINT 4: API REST Completa

| Campo | Detalle |
|-------|---------|
| **Sprint** | 4 de 14 |
| **Fase** | Fase 3 - API REST |
| **Inicio** | 24 de marzo 2026 (lunes) |
| **Deadline** | 4 de abril 2026 (viernes) |
| **Objetivo** | Todos los endpoints REST funcionales, datos financieros accesibles para el frontend con Decimals como strings |
| **User Stories** | Soporte indirecto para todas las US (capa de acceso) |

### Alcance

Este sprint construye la capa de API que conecta el backend con el frontend. Incluye serializers con campos calculados, ViewSets con filtros y paginacion, y endpoints especializados para datos de graficas.

### Mapa de Endpoints

```
/api/v1/
├── finance/
│   ├── projects/                          GET    Lista paginada, filtrable por health_status
│   ├── projects/{id}/                     GET    Detalle completo con phases, rates, snapshot
│   ├── projects/{id}/burndown/            GET    Serie temporal para grafica burndown
│   ├── projects/{id}/phase-comparison/    GET    Datos estimado vs actual por fase
│   ├── projects/{id}/health-history/      GET    Historial de HealthSnapshots
│   ├── portfolio/                         GET    Vista portfolio optimizada con semaforos
│   ├── alerts/                            GET    Lista de alertas (filtrable por is_read)
│   ├── alerts/{id}/mark-read/             PATCH  Marcar alerta como leida
│   ├── billing-roles/                     GET    Lista de tarifas
│   ├── billing-roles/                     POST   Crear tarifa
│   ├── billing-roles/{id}/               PUT    Actualizar tarifa
│   └── billing-roles/{id}/               DELETE Eliminar tarifa
├── integrations/
│   ├── sync/trigger/                      POST   Disparar sync manual
│   └── sync/status/                       GET    Estado del ultimo sync
└── reports/
    ├── projects/{id}/pdf/                 GET    Descargar PDF
    └── projects/{id}/excel/               GET    Descargar Excel
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 4.1 | Serializers: ProjectList, ProjectDetail, Burndown, PhaseComparison, Portfolio, Alert, BillingRole | 6 | P0 | Backend |
| 4.2 | `ProjectViewSet`: lista paginada con campos calculados, detalle con relations | 4 | P0 | Backend |
| 4.3 | Actions: burndown, phase-comparison, health-history en ProjectViewSet | 4 | P0 | Backend |
| 4.4 | `portfolio_view`: vista optimizada con aggregaciones SQL | 3 | P0 | Backend |
| 4.5 | `AlertViewSet`: GET filtrable + PATCH mark_read action | 3 | P0 | Backend |
| 4.6 | `BillingRoleViewSet`: CRUD completo | 2 | P1 | Backend |
| 4.7 | Configurar paginacion (PageNumberPagination), filtros (DjangoFilterBackend), ordering | 2 | P1 | Backend |
| 4.8 | Tests de integracion: request/response para cada endpoint | 4 | P0 | Backend |
| 4.9 | Verificar serialization: todos los Decimal llegan como string en JSON | 1 | P0 | QA |

**Total estimado: 29 horas**

### Archivos Entregables

```
backend/apps/finance/
├── serializers.py    ← 8+ serializers con campos calculados
├── views.py          ← ViewSets + portfolio view
├── urls.py           ← Router DRF + rutas custom
└── tests/
    └── test_api.py   ← Tests de integracion
```

### Criterios de Aceptacion (Definition of Done)

- [ ] `GET /api/v1/finance/projects/` retorna lista paginada con consumed_hours, consumption_percent, progress_percent
- [ ] `GET /api/v1/finance/projects/{id}/` retorna detalle con phases, role_rates, latest_snapshot, actual_cost
- [ ] `GET /api/v1/finance/projects/{id}/burndown/` retorna array de {date, budget_line, actual_cost_cumulative, earned_value_cumulative}
- [ ] `GET /api/v1/finance/projects/{id}/phase-comparison/` retorna array de {phase_name, estimated_hours, actual_hours}
- [ ] `GET /api/v1/finance/portfolio/` retorna resumen con semaforo por proyecto (optimizado con annotate/aggregate)
- [ ] `PATCH /api/v1/finance/alerts/{id}/mark-read/` actualiza is_read=True
- [ ] CRUD completo funcional en billing-roles
- [ ] Todos los valores Decimal serializados como `"string"` (no float)
- [ ] Paginacion funcional con `?page=N`
- [ ] Filtro por `?health_status=CRITICAL` funcional

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| N+1 queries en serializers anidados | Alta | Medio | Usar `select_related` y `prefetch_related` en ViewSets |
| Performance de burndown con muchos TimeEntries | Media | Medio | Aggregate en SQL, no iterar en Python |
| Campos calculados inconsistentes entre serializers | Media | Alto | Centralizar calculos en TripleAxisService |

---
---

# SPRINT 5: Frontend - Tipos, Servicios & Hooks

| Campo | Detalle |
|-------|---------|
| **Sprint** | 5 de 14 |
| **Fase** | Fase 4 - Frontend Datos |
| **Inicio** | 7 de abril 2026 (lunes) |
| **Deadline** | 18 de abril 2026 (viernes) |
| **Objetivo** | Capa de datos del frontend completa: tipos TS, validacion Zod, cliente API, hooks React Query |
| **User Stories** | Ninguna directa (fundamento para US-03 a US-08) |

### Alcance

Este sprint construye la "plomeria" del frontend: todo lo necesario para consumir la API de forma segura y tipada. Al finalizar, cualquier componente puede usar hooks como `useProjects()` o `useBurndown(id)` para acceder a datos validados del backend.

### Arquitectura de Datos del Frontend

```
┌─────────────────────────────────────────────────────────┐
│                    Componentes React                     │
│                                                         │
│   useProjects()  useBurndown()  useAlerts()  ...       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                    React Query Hooks                     │
│                                                         │
│  - Cache automatico    - Polling (alerts 30s)           │
│  - Invalidacion        - Mutations (billing roles)      │
│  - Loading/Error states                                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                   financeApi.ts                          │
│                                                         │
│  fetchProjects() -> schema.parse(response) -> typed     │
│  fetchBurndown() -> schema.parse(response) -> typed     │
│  [Validacion Zod en CADA respuesta]                     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                   apiClient.ts (Axios)                   │
│                                                         │
│  - baseURL: PUBLIC_API_URL                              │
│  - withCredentials: true                                │
│  - Request interceptor: camelCase -> snake_case         │
│  - Response interceptor: snake_case -> camelCase        │
└─────────────────────────────────────────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 5.1 | `types/finance.ts`: 13 interfaces (Project, ProjectDetail, Phase, BillingRole, etc.) | 3 | P0 | Frontend |
| 5.2 | `types/api.ts`: PaginatedResponse<T>, ApiError | 1 | P0 | Frontend |
| 5.3 | `services/schemas.ts`: 10 esquemas Zod que validan respuestas del backend | 4 | P0 | Frontend |
| 5.4 | `services/apiClient.ts`: Axios con interceptores snake_case <-> camelCase | 3 | P0 | Frontend |
| 5.5 | `services/financeApi.ts`: funciones tipadas + validacion Zod en cada llamada | 4 | P0 | Frontend |
| 5.6 | `services/formatters.ts`: formatCurrency, formatPercent, formatHours, getHealthColor | 2 | P1 | Frontend |
| 5.7 | `hooks/useProjects.ts` + `hooks/useProjectDetail.ts` (useQuery) | 2 | P0 | Frontend |
| 5.8 | `hooks/useBurndown.ts` + `hooks/usePhaseComparison.ts` + `hooks/useHealthHistory.ts` | 3 | P0 | Frontend |
| 5.9 | `hooks/usePortfolio.ts` + `hooks/useAlerts.ts` (polling 30s) + `hooks/useBillingRoles.ts` (CRUD mutations) | 3 | P0 | Frontend |
| 5.10 | `components/providers/QueryProvider.tsx` | 1 | P0 | Frontend |
| 5.11 | Verificar `npm run typecheck` sin errores, cero `any` | 2 | P0 | QA |

**Total estimado: 28 horas**

### Archivos Entregables

```
frontend/src/
├── types/
│   ├── finance.ts          ← 13 interfaces TypeScript
│   └── api.ts              ← PaginatedResponse<T>, ApiError
├── services/
│   ├── schemas.ts          ← 10 esquemas Zod
│   ├── apiClient.ts        ← Axios configurado
│   ├── financeApi.ts       ← Funciones API tipadas
│   └── formatters.ts       ← Utilidades de formato
├── hooks/
│   ├── useProjects.ts
│   ├── useBurndown.ts
│   ├── usePhaseComparison.ts
│   ├── useHealthHistory.ts
│   ├── usePortfolio.ts
│   ├── useAlerts.ts
│   └── useBillingRoles.ts
└── components/
    └── providers/
        └── QueryProvider.tsx
```

### Criterios de Aceptacion (Definition of Done)

- [ ] `npm run typecheck` pasa sin errores con strict: true
- [ ] Cero uso de `any` en todo el codigo TypeScript
- [ ] Todas las respuestas del backend pasan por `schema.parse()` de Zod antes de llegar a componentes
- [ ] Interceptores transforman correctamente:
  - Request: `{ budgetHours: 100 }` -> `{ budget_hours: 100 }`
  - Response: `{ budget_hours: "100.00" }` -> `{ budgetHours: "100.00" }`
- [ ] `useAlerts()` hace polling cada 30 segundos (refetchInterval: 30000)
- [ ] `useBillingRoles()` expone mutations: create, update, delete con invalidacion de cache
- [ ] QueryProvider envuelve la app con configuracion de staleTime, gcTime

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Tipos TS desincronizados con respuesta real del backend | Alta | Alto | Zod como fuente de verdad, errores visibles en consola |
| Transformacion camelCase falla en campos anidados | Media | Medio | Tests manuales con respuestas complejas (ProjectDetail) |
| Polling de alerts causa carga excesiva | Baja | Bajo | 30s es conservador, ajustable via config |

---
---

# SPRINT 6: Frontend - Componentes Visuales

| Campo | Detalle |
|-------|---------|
| **Sprint** | 6 de 14 |
| **Fase** | Fase 5 - Componentes Visuales |
| **Inicio** | 21 de abril 2026 (lunes) |
| **Deadline** | 2 de mayo 2026 (viernes) |
| **Objetivo** | Todos los componentes React implementados: layout, atomicos, graficas, compuestos |
| **User Stories** | US-03, US-04, US-05, US-06, US-07 |

### Alcance

Sprint con mayor cantidad de User Stories. Se implementan los componentes visuales del dashboard: desde los layout Astro, pasando por componentes atomicos, graficas Recharts, hasta los componentes compuestos que integran todo.

### Jerarquia de Componentes

```
DashboardShell.astro
├── Sidebar.astro
│   └── Links de navegacion (SVG icons)
├── PageHeader.astro
│   └── Titulo + subtitulo
└── [Contenido dinámico - React Islands]
    │
    ├── AlertNotificationBell.tsx (US-07) ─── useAlerts()
    │   └── Dropdown con lista de alertas
    │
    ├── PortfolioTable.tsx (US-05) ─── usePortfolio()
    │   ├── StatusBadge.tsx (por fila)
    │   └── Filtros + Ordenamiento
    │
    ├── ProjectDashboard.tsx ─── useProjectDetail()
    │   ├── HealthGaugeChart.tsx
    │   ├── MetricCard.tsx (x3: consumo, progreso, costo)
    │   ├── FinancialBurndownChart.tsx (US-04) ─── useBurndown()
    │   │   └── TableViewToggle + AccessibleDataTable
    │   ├── TripleAxisCard.tsx
    │   │   ├── MetricCard.tsx (x3)
    │   │   ├── PhaseComparisonChart.tsx (US-06) ─── usePhaseComparison()
    │   │   │   └── TableViewToggle + AccessibleDataTable
    │   │   └── AlertBanner.tsx (condicional)
    │   ├── HealthTrendChart.tsx ─── useHealthHistory()
    │   └── ExportButtons.tsx (US-08, placeholder)
    │
    └── BillingRolesManager.tsx (US-03) ─── useBillingRoles()
        └── Tabla editable inline (CRUD)
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | US | Responsable |
|----|-------|-------|-----------|-----|-------------|
| 6.1 | Layout Astro: DashboardShell, Sidebar (navegacion con iconos SVG), PageHeader | 4 | P0 | - | Frontend |
| 6.2 | Atomicos: StatusBadge (pill con color + icono), MetricCard (tabular-nums), AlertBanner (dismissable) | 3 | P0 | - | Frontend |
| 6.3 | AlertNotificationBell: campana con badge de count + dropdown con lista | 3 | P0 | US-07 | Frontend |
| 6.4 | FinancialBurndownChart: LineChart con 3 lineas (Budget dashed grey, Actual solid red, Earned Value solid green) + toggle tabla accesible | 5 | P0 | US-04 | Frontend |
| 6.5 | PhaseComparisonChart: BarChart con barras Estimado (primary) vs Actual (color dinamico segun desfase) + toggle tabla | 4 | P0 | US-06 | Frontend |
| 6.6 | HealthGaugeChart: RadialBarChart con arco de color dinamico y score numerico central | 3 | P1 | - | Frontend |
| 6.7 | HealthTrendChart: AreaChart con gradiente de color basado en historial de snapshots | 3 | P1 | - | Frontend |
| 6.8 | TableViewToggle (boton accesible) + AccessibleDataTable (tabla HTML semantica WCAG AA) | 3 | P0 | - | Frontend |
| 6.9 | TripleAxisCard: composicion de 3 MetricCards + PhaseComparisonChart + AlertBanner condicional | 3 | P0 | - | Frontend |
| 6.10 | PortfolioTable: tabla con StatusBadge por fila, ordenable por columnas, filtrable por status | 4 | P0 | US-05 | Frontend |
| 6.11 | BillingRolesManager: tabla editable inline con crear/editar/eliminar tarifas | 4 | P0 | US-03 | Frontend |
| 6.12 | ProjectDashboard: grid completo del detalle (Gauge + Metrics + Burndown + TripleAxis + Trend) | 4 | P0 | - | Frontend |

**Total estimado: 43 horas**

### Archivos Entregables

```
frontend/src/components/
├── layout/
│   ├── DashboardShell.astro
│   ├── Sidebar.astro
│   └── PageHeader.astro
├── dashboard/
│   ├── StatusBadge.tsx
│   ├── MetricCard.tsx
│   ├── AlertBanner.tsx
│   ├── AlertNotificationBell.tsx     ← US-07
│   ├── AlertsList.tsx
│   ├── PortfolioTable.tsx            ← US-05
│   ├── BillingRolesManager.tsx       ← US-03
│   ├── TripleAxisCard.tsx
│   ├── ProjectDashboard.tsx
│   └── ExportButtons.tsx             ← placeholder
└── charts/
    ├── FinancialBurndownChart.tsx     ← US-04
    ├── PhaseComparisonChart.tsx       ← US-06
    ├── HealthGaugeChart.tsx
    ├── HealthTrendChart.tsx
    ├── TableViewToggle.tsx
    └── AccessibleDataTable.tsx
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-03:** BillingRolesManager permite crear, editar y eliminar tarifas con feedback visual
- [ ] **US-04:** BurndownChart muestra 3 lineas diferenciadas (Budget dashed gris, Actual rojo, EV verde)
- [ ] **US-05:** PortfolioTable muestra semaforo por proyecto, ordenable por todas las columnas
- [ ] **US-06:** PhaseComparisonChart muestra barras Estimado vs Actual con color dinamico por desfase
- [ ] **US-07:** AlertNotificationBell muestra badge con count de no leidas, dropdown con lista
- [ ] Todas las graficas tienen toggle Grafico/Tabla (accesibilidad WCAG AA)
- [ ] Tablas accesibles usan `<table>`, `<thead>`, `<th scope>`, `<tbody>` semanticos
- [ ] Numeros financieros usan `font-variant-numeric: tabular-nums`
- [ ] Todos los colores usan tokens del Design System (no hex hardcodeados)
- [ ] Componentes Astro (.astro) son solo layout, sin estado
- [ ] Componentes React (.tsx) son las islas interactivas

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Recharts performance con > 1000 data points | Media | Medio | Limitar puntos en API, usar `isAnimationActive={false}` |
| Accesibilidad WCAG AA insuficiente | Media | Medio | Revisar con aXe DevTools, keyboard nav testing |
| Sprint mas cargado del proyecto (43h) | Alta | Alto | Priorizar US obligatorias, diferir HealthGauge/Trend si necesario |

---
---

# SPRINT 7: Paginas Astro & Reportes PDF/Excel

| Campo | Detalle |
|-------|---------|
| **Sprint** | 7 de 14 |
| **Fases** | Fase 6 (Paginas) + Fase 7 (Reportes) |
| **Inicio** | 5 de mayo 2026 (lunes) |
| **Deadline** | 16 de mayo 2026 (viernes) |
| **Objetivo** | 5 paginas navegables en el frontend + exportacion PDF y Excel funcional |
| **User Stories** | US-08 (PDF Export) |

### Alcance

Sprint dividido en dos frentes paralelos:
1. **Frontend (Fase 6):** Paginas Astro que montan los componentes React como islas
2. **Backend (Fase 7):** Generadores de reportes PDF (WeasyPrint) y Excel (OpenPyXL)

### Mapa de Navegacion

```
┌─────────────────────────────────────────────────────────┐
│                     Sidebar                              │
│                                                         │
│  [Dashboard]    ──>  /                (index.astro)     │
│  [Portfolio]    ──>  /portfolio       (portfolio.astro)  │
│  [Tarifas]      ──>  /billing-roles   (billing-roles)   │
│  [Alertas]      ──>  /alerts          (alerts.astro)    │
│                                                         │
│  Desde Portfolio o Dashboard:                           │
│  [Click proyecto] ──> /projects/{id}  ([id].astro)     │
│                                                         │
│  Desde Detalle de Proyecto:                             │
│  [Exportar PDF]   ──> GET /api/.../pdf/                 │
│  [Exportar Excel] ──> GET /api/.../excel/               │
└─────────────────────────────────────────────────────────┘
```

### Backlog del Sprint

#### Fase 6: Paginas Astro

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 7.1 | `pages/index.astro`: Dashboard home con PortfolioTable + AlertNotificationBell | 2 | P0 | Frontend |
| 7.2 | `pages/projects/[id].astro`: Detalle con ProjectDashboard (client:load) | 3 | P0 | Frontend |
| 7.3 | `pages/portfolio.astro`: Vista completa de portfolio | 2 | P0 | Frontend |
| 7.4 | `pages/billing-roles.astro`: Gestion de tarifas con BillingRolesManager | 2 | P1 | Frontend |
| 7.5 | `pages/alerts.astro`: Historial de alertas con AlertsList | 2 | P1 | Frontend |
| 7.6 | Verificar todas las islas React montan con `client:load` | 1 | P0 | Frontend |

#### Fase 7: Reportes

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 7.7 | Template HTML/CSS para PDF A4: portada, resumen ejecutivo, tablas de fases | 4 | P0 | Backend |
| 7.8 | `pdf_generator.py`: WeasyPrint con datos de proyecto, fases, time entries | 4 | P0 | Backend |
| 7.9 | `excel_generator.py`: OpenPyXL con 4 hojas (Resumen, Time Entries, Por Fase, Historico) | 4 | P0 | Backend |
| 7.10 | Endpoints: GET `.../pdf/` y `.../excel/` con FileResponse + headers de descarga | 2 | P0 | Backend |
| 7.11 | `ExportButtons.tsx`: botones PDF/Excel con loading state y descarga directa | 2 | P0 | Frontend |
| 7.12 | Verificar PDF con datos reales: layout correcto, datos completos, A4 | 2 | P0 | QA |

**Total estimado: 30 horas**

### Archivos Entregables

```
frontend/src/pages/
├── index.astro                    ← Dashboard home
├── portfolio.astro                ← Vista portfolio
├── billing-roles.astro            ← Gestion tarifas
├── alerts.astro                   ← Historial alertas
└── projects/
    └── [id].astro                 ← Detalle proyecto

backend/apps/reports/
├── pdf_generator.py               ← Generador PDF
├── excel_generator.py             ← Generador Excel
├── views.py                       ← Endpoints de descarga
├── urls.py                        ← Rutas
└── templates/reports/
    ├── project_report.html        ← Template HTML A4
    └── report_styles.css          ← Estilos del PDF
```

### Criterios de Aceptacion (Definition of Done)

- [ ] Las 5 rutas del frontend retornan HTTP 200 y renderizan contenido
- [ ] Navegacion desde Sidebar funciona sin recargas innecesarias
- [ ] Pagina de detalle `/projects/{id}` recibe el ID y lo pasa al componente React
- [ ] Todos los componentes React se montan con `client:load`
- [ ] **US-08:** PDF genera documento A4 valido con:
  - Portada con nombre del proyecto y fecha
  - Resumen ejecutivo (metricas clave)
  - Tabla de comparacion por fases
  - Lista de time entries
- [ ] Excel genera archivo .xlsx con 4 hojas (Resumen, Time Entries, Por Fase, Historico)
- [ ] Botones de exportacion muestran spinner durante descarga
- [ ] Headers de respuesta incluyen `Content-Disposition: attachment`

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| WeasyPrint renderiza diferente en Linux vs macOS | Media | Bajo | Probar siempre dentro del container Docker |
| Excel con muchos rows (>10K time entries) es lento | Baja | Bajo | Paginacion o limite en generacion |
| Astro SSG no puede pasar parametros dinamicos a islas | Baja | Medio | Usar `Astro.params` + data attributes |

---
---

# SPRINT 8: Integracion E2E, QA & Pulido

| Campo | Detalle |
|-------|---------|
| **Sprint** | 8 de 14 |
| **Fase** | Testing & Quality Assurance |
| **Inicio** | 19 de mayo 2026 (lunes) |
| **Deadline** | 30 de mayo 2026 (viernes) |
| **Objetivo** | Sistema completamente integrado, bugs criticos corregidos, performance aceptable, accesibilidad verificada |
| **User Stories** | Verificacion de todas las US (US-01 a US-08) |

### Alcance

Sprint dedicado a integracion end-to-end, correccion de bugs, optimizacion de performance y revision de accesibilidad. No se desarrollan features nuevas; se pule lo existente.

### Flujo E2E a Verificar

```
1. Crear proyecto via Admin
   └── Configurar budget_hours, phases, billing_roles

2. Configurar integraciones
   └── jira_project_key + clockify_project_id

3. Ejecutar sync manual (POST /api/v1/integrations/sync/trigger/)
   └── TimeEntries creadas con costos correctos

4. Celery evalua salud (automatico o manual)
   └── HealthSnapshot creado
   └── Project.current_health_status actualizado
   └── Si cambio a CRITICAL -> ProjectHealthAlert creada

5. Frontend: Navegar a /
   └── PortfolioTable muestra proyecto con semaforo correcto

6. Frontend: Click en proyecto -> /projects/{id}
   └── GaugeChart muestra score
   └── BurndownChart muestra 3 lineas
   └── PhaseComparisonChart muestra barras
   └── MetricCards muestran valores correctos

7. Frontend: AlertNotificationBell
   └── Badge muestra count de alertas no leidas
   └── Click -> dropdown con alertas
   └── Marcar como leida -> badge se actualiza

8. Exportar PDF -> documento valido
9. Exportar Excel -> archivo valido con 4 hojas
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 8.1 | Flujo E2E manual: pasos 1-9 del diagrama anterior | 4 | P0 | QA |
| 8.2 | Verificar pipeline Celery: sync -> snapshot -> alerta -> polling frontend | 4 | P0 | Backend + QA |
| 8.3 | Corregir bugs encontrados durante E2E (buffer de 8h) | 8 | P0 | Backend + Frontend |
| 8.4 | Optimizar queries: `select_related`, `prefetch_related` en ViewSets criticos | 3 | P0 | Backend |
| 8.5 | Verificar CORS: frontend Astro (:4321) -> Django API (:8001) sin errores | 2 | P0 | Backend |
| 8.6 | Tests edge cases: proyecto sin time entries, sin phases, sin snapshots | 3 | P1 | Backend |
| 8.7 | Validar logica de alertas: solo en CAMBIO de estado, no duplicadas | 2 | P0 | QA |
| 8.8 | Revision accesibilidad WCAG AA: aXe DevTools + keyboard navigation | 3 | P1 | Frontend |
| 8.9 | Revision responsive: desktop (1280px+), tablet (768px+) | 2 | P1 | Frontend |
| 8.10 | Limpiar: TODOs, console.logs, imports no usados, codigo muerto | 2 | P2 | Todos |

**Total estimado: 33 horas**

### Criterios de Aceptacion (Definition of Done)

- [ ] Flujo E2E completo (9 pasos) ejecutado sin errores manuales
- [ ] `pytest` pasa todos los tests (unitarios + integracion)
- [ ] `npm run typecheck` pasa sin errores
- [ ] Dashboard principal carga en < 3 segundos
- [ ] No hay errores en consola del navegador en ninguna pagina
- [ ] No hay queries N+1 en endpoints de portfolio ni detalle
- [ ] Alertas no se duplican tras evaluaciones consecutivas sin cambio de estado
- [ ] CORS funciona: no hay errores "Access-Control-Allow-Origin" en consola
- [ ] Todas las graficas son accesibles via toggle tabla (WCAG AA)
- [ ] Keyboard navigation funciona en PortfolioTable y BillingRolesManager
- [ ] Sin TODOs, console.logs ni imports muertos en el codigo

### Checklist de Verificacion por User Story

| US | Titulo | Status |
|----|--------|--------|
| US-01 | Clockify sync cada hora | [ ] Verificado |
| US-02 | Match Jira-Clockify | [ ] Verificado |
| US-03 | Tarifas por rol (CRUD) | [ ] Verificado |
| US-04 | Financial Burndown Chart | [ ] Verificado |
| US-05 | Portfolio con semaforos | [ ] Verificado |
| US-06 | Phase Comparison Chart | [ ] Verificado |
| US-07 | Notificacion in-app Critical | [ ] Verificado |
| US-08 | Export PDF/Excel | [ ] Verificado |

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Bugs de integracion mas complejos de lo estimado (>8h) | Alta | Alto | Priorizar por severidad, diferir bugs cosmeticos a Sprint 9 |
| Performance inaceptable con volumen real | Media | Alto | Profiling con Django Debug Toolbar, indices adicionales |
| Accesibilidad requiere refactoring significativo | Baja | Medio | Priorizar solo navegacion por teclado y labels |

---
---

# SPRINT 9: UAT, Performance & Deploy

| Campo | Detalle |
|-------|---------|
| **Sprint** | 9 de 14 |
| **Fase** | Lanzamiento |
| **Inicio** | 2 de junio 2026 (lunes) |
| **Deadline** | 13 de junio 2026 (viernes) |
| **Objetivo** | Sistema validado por stakeholders, desplegado en produccion, documentacion de operaciones entregada |
| **User Stories** | Validacion final de todas (US-01 a US-08) |
| **Buffer post-sprint** | 2 dias (hasta 15 Jun) para hotfixes |

### Alcance

Sprint final que incluye User Acceptance Testing con stakeholders de Appix, correccion de feedback, configuracion del entorno de produccion y deploy. Al finalizar, el dashboard esta accesible para los usuarios finales.

### Plan de Deploy

```
DESARROLLO (actual)                    PRODUCCION (objetivo)
────────────────────                   ─────────────────────
docker-compose.yml                     docker-compose.prod.yml
  django: runserver                      django: gunicorn
  astro-dev: npm run dev                 nginx: static files (astro build)
  DEBUG=True                             DEBUG=False
  localhost:8001                         dashboard.appix.com (o IP interna)
  localhost:4321                         servido por nginx :80/:443
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 9.1 | Sesion UAT con stakeholders (preparar escenarios, ejecutar, recopilar feedback) | 4 | P0 | Product Owner + QA |
| 9.2 | Corregir feedback critico de UAT (priorizado por severidad) | 8 | P0 | Backend + Frontend |
| 9.3 | Crear `docker-compose.prod.yml` con configuracion de produccion | 4 | P0 | DevOps/Backend |
| 9.4 | Configurar variables de entorno de produccion (.env.prod) | 2 | P0 | DevOps |
| 9.5 | Reemplazar `runserver` por Gunicorn con workers configurados | 2 | P0 | Backend |
| 9.6 | Build de produccion de Astro (`npm run build` -> output static) | 2 | P0 | Frontend |
| 9.7 | Configurar nginx para servir archivos estaticos de Astro + proxy reverso a Django | 3 | P1 | DevOps |
| 9.8 | Test de carga basico: simular 10 usuarios concurrentes | 3 | P1 | QA |
| 9.9 | Documentacion de operaciones: sync manual, ver logs Celery, troubleshooting | 2 | P1 | Backend |
| 9.10 | Deploy a servidor de produccion | 3 | P0 | DevOps |
| 9.11 | Verificacion post-deploy: todos los servicios, sync, dashboard, exportes | 2 | P0 | QA |

**Total estimado: 35 horas**

### Escenarios de UAT

| # | Escenario | Actor | Resultado Esperado |
|---|----------|-------|--------------------|
| UAT-1 | Ver portfolio con multiples proyectos | Director | Tabla con semaforos correctos, ordenable |
| UAT-2 | Ver detalle de proyecto critico | PM | Gauge rojo, burndown divergente, alerta visible |
| UAT-3 | Ver detalle de proyecto healthy | PM | Gauge verde, burndown alineado |
| UAT-4 | Configurar tarifas por rol | PM | CRUD funcional, cambios reflejados en costos |
| UAT-5 | Recibir notificacion de proyecto critico | PM | Campana con badge, dropdown con alerta |
| UAT-6 | Exportar PDF de un proyecto | Usuario | PDF A4 descargado con datos correctos |
| UAT-7 | Exportar Excel de un proyecto | Usuario | .xlsx con 4 hojas y datos correctos |
| UAT-8 | Forzar sync y ver actualizacion | PM | Datos actualizados tras sync manual |

### Criterios de Aceptacion (Definition of Done)

- [ ] Stakeholders aprueban el sistema en sesion UAT (minimo 6/8 escenarios pasan)
- [ ] Feedback critico de UAT corregido e incorporado
- [ ] Gunicorn sirve Django en produccion con al menos 3 workers
- [ ] Astro build genera archivos estaticos servidos por nginx
- [ ] Todos los servicios Docker estables en produccion (uptime > 24h sin crashes)
- [ ] Celery Beat ejecuta sync automatico en produccion (verificar con SyncLog)
- [ ] Dashboard accesible desde la red interna de Appix
- [ ] Documentacion de operaciones entregada y revisada
- [ ] SECRET_KEY, DB passwords y API tokens seguros (no en repositorio)
- [ ] DEBUG=False, ALLOWED_HOSTS configurado

### Dependencias Externas (BLOQUEANTES)

| Dependencia | Estado | Responsable | Fecha limite |
|-------------|--------|-------------|-------------|
| Servidor/VPS de produccion | Pendiente | DevOps/Infra | 2 Jun 2026 |
| Dominio o subdominio configurado | Pendiente | DevOps/Infra | 2 Jun 2026 |
| Acceso SSH al servidor | Pendiente | DevOps | 2 Jun 2026 |
| API keys de Clockify (produccion) | Debe estar desde Sprint 3 | Admin Clockify | Ya resuelto |
| API token de Jira (produccion) | Debe estar desde Sprint 3 | Admin Jira | Ya resuelto |
| Agendamiento sesion UAT | Pendiente | Product Owner | 26 May 2026 |

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Feedback de UAT requiere cambios grandes | Media | Alto | Priorizar solo criticos, diferir mejoras a fase 2 |
| Servidor de produccion no disponible a tiempo | Media | Critico | Tener alternativa (VPS cloud, Render, Railway) |
| Configuracion de red/firewall bloquea APIs externas | Media | Alto | Probar conectividad a Clockify/Jira desde servidor antes del deploy |
| WeasyPrint falla en servidor de produccion | Baja | Medio | Verificar dependencias de sistema en servidor |

---
---

# RELEASE 2: PORTAL DE CLIENTE + GESTION DE CAMBIOS

> Los sprints 10-14 extienden la plataforma con el Tenant de Cliente y la gestion de solicitudes
> de cambio de alcance. Requieren que Release 1 este desplegado y estable.

---
---

# SPRINT 10: Multi-Tenant Auth & Modelos de Cliente

| Campo | Detalle |
|-------|---------|
| **Sprint** | 10 de 14 |
| **Fase** | Fase 8 - Arquitectura Multi-Tenant |
| **Inicio** | 16 de junio 2026 (lunes) |
| **Deadline** | 27 de junio 2026 (viernes) |
| **Objetivo** | Sistema de autenticacion con roles multi-tenant, nuevos modelos de datos para el portal de cliente |
| **User Stories** | US-09 (Roles Multi-Tenant), US-10 (Aislamiento de Datos) |
| **Prerequisito** | Release 1 desplegado (Sprint 9) |

### Alcance

Este sprint transforma la arquitectura existente de single-tenant a multi-tenant. Se introduce el concepto de Organization (tenant), roles diferenciados (Admin/PM vs Cliente) y aislamiento de datos. Tambien se crean los modelos necesarios para el portal de cliente: hitos de pago y requerimientos.

### Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTENTICACION                            │
│                                                             │
│  Django Session Auth (existente)                            │
│  + UserProfile (nuevo): FK User + FK Organization + role    │
│                                                             │
│  Roles:                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  ADMIN   │  │    PM    │  │ DIRECTOR │  │  CLIENT  │   │
│  │ Ve todo  │  │ Ve sus   │  │ Ve todo  │  │ Ve solo  │   │
│  │ Edita    │  │ proyectos│  │ Solo lee │  │ sus proy │   │
│  │ todo     │  │ Edita    │  │          │  │ Solo lee │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   MIDDLEWARE TENANT                           │
│                                                             │
│  request.organization = UserProfile.organization            │
│  Todos los QuerySets filtrados por organization             │
│  Admin ve todo, Client ve solo su organization              │
└─────────────────────────────────────────────────────────────┘
```

### Nuevos Modelos de Datos

```
┌──────────────────┐
│   Organization   │
│──────────────────│
│ name             │
│ slug             │
│ logo             │
│ primary_color    │
│ is_active        │
│ created_at       │
└───────┬──────────┘
        │
        ├────< ┌──────────────────┐
        │      │   UserProfile    │
        │      │──────────────────│
        │      │ FK User (1:1)   │
        │      │ FK Organization │
        │      │ role (enum)     │
        │      │ phone           │
        │      │ is_primary      │
        │      └──────────────────┘
        │
        ├────< ┌──────────────────┐
        │      │ PaymentMilestone │
        │      │──────────────────│
        │      │ FK Project       │
        │      │ description     │
        │      │ amount (Decimal)│
        │      │ due_date        │
        │      │ status (enum)   │
        │      │  pending/paid/  │
        │      │  overdue        │
        │      │ paid_date       │
        │      └──────────────────┘
        │
        └────< ┌────────────────────┐
               │ ClientRequirement  │
               │────────────────────│
               │ FK Project         │
               │ description        │
               │ status (enum)      │
               │  pending/delivered/│
               │  verified          │
               │ due_date           │
               │ delivered_at       │
               │ notes              │
               └────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 10.1 | Modelo `Organization`: name, slug, logo, primary_color, is_active | 3 | P0 | Backend |
| 10.2 | Modelo `UserProfile`: FK User (OneToOne) + FK Organization + role (admin/pm/director/client) | 3 | P0 | Backend |
| 10.3 | Modelo `ClientContact` extendido o merge con UserProfile (phone, is_primary) | 2 | P0 | Backend |
| 10.4 | Extender modelo `Project` con FK `client_organization` (Organization del cliente) | 2 | P0 | Backend |
| 10.5 | `TenantMiddleware`: inyectar `request.organization` en cada request basado en UserProfile | 4 | P0 | Backend |
| 10.6 | Permisos DRF: `IsAdminUser`, `IsPMUser`, `IsClientUser` con logica de acceso granular | 4 | P0 | Backend |
| 10.7 | Actualizar todos los ViewSets existentes para filtrar por tenant (no romper R1) | 4 | P0 | Backend |
| 10.8 | Login/Logout views para portal de cliente (session auth, redirect por rol) | 3 | P0 | Backend |
| 10.9 | Modelo `PaymentMilestone`: FK Project + amount, due_date, status, paid_date | 3 | P0 | Backend |
| 10.10 | Modelo `ClientRequirement`: FK Project + description, status, due_date, delivered_at | 3 | P0 | Backend |
| 10.11 | Migraciones + data migration para Organization default (Appix) | 2 | P0 | Backend |
| 10.12 | Tests de permisos: cliente solo ve sus proyectos, 403 en datos ajenos | 4 | P0 | Backend |
| 10.13 | Seed data: Organization de prueba + usuario cliente + PaymentMilestones | 2 | P1 | QA |

**Total estimado: 39 horas**

### Archivos Entregables

```
backend/apps/
├── accounts/                      ← NUEVA APP
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py                  ← Organization, UserProfile
│   ├── middleware.py              ← TenantMiddleware
│   ├── permissions.py             ← IsAdmin, IsPM, IsClient
│   ├── serializers.py             ← Login, UserProfile
│   ├── views.py                   ← Login, Logout, Profile
│   ├── urls.py
│   ├── admin.py
│   ├── migrations/
│   └── tests/
│       ├── test_permissions.py
│       └── test_tenant_isolation.py
├── finance/
│   ├── models.py                  ← +PaymentMilestone, +ClientRequirement
│   └── migrations/
│       └── 000X_add_tenant_fields.py
└── core/
    ├── settings.py                ← +accounts en INSTALLED_APPS, +middleware
    └── urls.py                    ← +accounts urls
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-09:** Login con role=client redirige a portal de cliente, role=admin redirige a dashboard admin
- [ ] **US-10:** GET `/api/v1/finance/projects/` como cliente retorna SOLO proyectos de su Organization
- [ ] GET `/api/v1/finance/projects/` como admin retorna TODOS los proyectos (sin romper R1)
- [ ] Middleware inyecta `request.organization` correctamente en cada request autenticado
- [ ] 403 Forbidden si cliente intenta acceder a proyecto de otra Organization
- [ ] Modelos PaymentMilestone y ClientRequirement migrados correctamente
- [ ] Data migration crea Organization "Appix" y asigna todos los usuarios existentes
- [ ] Tests de aislamiento: cliente A no ve datos de cliente B
- [ ] ViewSets existentes del R1 siguen funcionando identicamente para usuarios admin

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Refactoring de ViewSets rompe funcionalidad R1 | Alta | Critico | Tests de regresion exhaustivos antes de mergear |
| Migraciones corrompen datos existentes en produccion | Media | Critico | Data migration con rollback, backup previo |
| Performance degradada por filtros de tenant en cada query | Baja | Medio | Indices en organization_id en todos los modelos |

---
---

# SPRINT 11: Gestion de Cambios de Alcance

| Campo | Detalle |
|-------|---------|
| **Sprint** | 11 de 14 |
| **Fase** | Fase 9 - Change Request Management |
| **Inicio** | 30 de junio 2026 (lunes) |
| **Deadline** | 11 de julio 2026 (viernes) |
| **Objetivo** | Flujo completo de solicitudes de cambio: desde el request del cliente hasta la aprobacion interna y ajuste de presupuesto |
| **User Stories** | US-11 (Flujo de CR), US-12 (Ajuste automatico de presupuesto) |

### Alcance

Este sprint implementa el sistema de gestion de solicitudes de cambio de alcance (Change Requests). Es un flujo bidireccional: el cliente puede solicitar cambios, el PM cotiza y aprueba, y al aprobar se ajusta automaticamente el presupuesto del proyecto.

### Maquina de Estados - Change Request

```
                    ┌──────────┐
                    │  DRAFT   │  Cliente crea borrador
                    └────┬─────┘
                         │ Cliente envia
                         v
                    ┌──────────┐
                    │SUBMITTED │  PM recibe notificacion
                    └────┬─────┘
                         │ PM cotiza (agrega horas + costo)
                         v
                    ┌──────────┐
                    │  QUOTED  │  Cliente recibe cotizacion
                    └────┬─────┘
                    ┌────┴─────┐
                    │          │
                    v          v
              ┌──────────┐ ┌──────────┐
              │ APPROVED │ │ REJECTED │  Cliente o PM decide
              └────┬─────┘ └──────────┘
                   │
                   │ budget_hours += estimated_hours
                   v
              ┌─────────────┐
              │ IN_PROGRESS │  Trabajo en curso
              └──────┬──────┘
                     │ PM marca como completado
                     v
              ┌──────────┐
              │COMPLETED │  Cambio implementado
              └──────────┘
```

### Modelo de Datos

```
┌────────────────────────┐      ┌───────────────────────────┐
│    ChangeRequest       │      │  ChangeRequestComment     │
│────────────────────────│      │───────────────────────────│
│ FK Project             │─────<│ FK ChangeRequest          │
│ title                  │      │ FK User (author)          │
│ description            │      │ message (text)            │
│ requested_by (FK User) │      │ created_at                │
│ assigned_to (FK User)  │      └───────────────────────────┘
│ status (enum)          │
│ priority (low/med/high)│
│ estimated_hours        │  ← PM llena al cotizar
│ estimated_cost         │  ← PM llena al cotizar
│ approved_by (FK User)  │
│ approved_at            │
│ created_at             │
│ updated_at             │
└────────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 11.1 | Modelo `ChangeRequest`: FK Project + titulo, descripcion, status, horas/costo estimados | 4 | P0 | Backend |
| 11.2 | Modelo `ChangeRequestComment`: FK ChangeRequest + autor + mensaje + timestamp | 2 | P0 | Backend |
| 11.3 | Status machine con validaciones: solo transiciones validas permitidas (DRAFT->SUBMITTED, etc.) | 4 | P0 | Backend |
| 11.4 | API: `ChangeRequestViewSet` CRUD + action transitions (submit, quote, approve, reject, complete) | 5 | P0 | Backend |
| 11.5 | API: `ChangeRequestCommentViewSet` para comentarios bidireccionales | 2 | P0 | Backend |
| 11.6 | Logica: al aprobar CR, sumar `estimated_hours` al `budget_hours` del proyecto automaticamente | 3 | P0 | Backend |
| 11.7 | Frontend tipos + schemas Zod para ChangeRequest y Comments | 2 | P0 | Frontend |
| 11.8 | Hooks: `useChangeRequests()`, `useChangeRequestDetail()`, mutations de transicion | 3 | P0 | Frontend |
| 11.9 | `ChangeRequestsTable.tsx`: tabla de CRs con filtros por status, prioridad | 4 | P0 | Frontend |
| 11.10 | `ChangeRequestTimeline.tsx`: timeline visual del flujo con iconos por estado | 4 | P1 | Frontend |
| 11.11 | `ChangeRequestForm.tsx`: formulario de creacion/edicion (cotizacion para PM) | 3 | P0 | Frontend |
| 11.12 | Pagina `/change-requests` en dashboard admin | 2 | P0 | Frontend |
| 11.13 | Pagina `/projects/[id]/change-requests` detalle de CRs por proyecto | 2 | P1 | Frontend |
| 11.14 | Tests: flujo completo DRAFT -> APPROVED -> budget_hours actualizado | 3 | P0 | Backend |
| 11.15 | Tests: transiciones invalidas retornan 400 (ej: DRAFT -> COMPLETED) | 2 | P0 | Backend |

**Total estimado: 45 horas**

### Archivos Entregables

```
backend/apps/
├── changes/                           ← NUEVA APP
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py                      ← ChangeRequest, ChangeRequestComment
│   ├── serializers.py
│   ├── views.py                       ← ViewSet con transiciones
│   ├── urls.py
│   ├── state_machine.py               ← Validacion de transiciones
│   ├── admin.py
│   ├── migrations/
│   └── tests/
│       ├── test_state_machine.py
│       └── test_budget_adjustment.py

frontend/src/
├── types/
│   └── changes.ts                     ← Interfaces ChangeRequest, Comment
├── services/
│   └── changesApi.ts                  ← API functions + Zod schemas
├── hooks/
│   └── useChangeRequests.ts           ← React Query hooks + mutations
├── components/
│   └── changes/
│       ├── ChangeRequestsTable.tsx
│       ├── ChangeRequestTimeline.tsx
│       └── ChangeRequestForm.tsx
└── pages/
    ├── change-requests.astro
    └── projects/
        └── [id]/
            └── change-requests.astro
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-11:** Flujo completo funciona: DRAFT -> SUBMITTED -> QUOTED -> APPROVED -> IN_PROGRESS -> COMPLETED
- [ ] **US-12:** Al aprobar un CR con 20h estimadas, `project.budget_hours` se incrementa en 20h
- [ ] Transiciones invalidas retornan HTTP 400 con mensaje descriptivo
- [ ] Solo el PM/Admin puede cotizar (agregar horas/costo estimados)
- [ ] Solo el PM/Admin o el solicitante puede aprobar/rechazar
- [ ] Comentarios bidireccionales visibles para ambos tenants
- [ ] Timeline muestra historial completo con timestamps y actores
- [ ] Tabla de CRs filtrable por status, prioridad y proyecto
- [ ] Al rechazar un CR, el presupuesto NO se modifica
- [ ] Evaluacion de salud (Triple Axis) refleja nuevo budget tras aprobar CR

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Ajuste de budget afecta calculos retroactivos de Triple Axis | Media | Alto | Recalcular salud inmediatamente despues de aprobar CR |
| Maquina de estados se vuelve compleja con edge cases | Media | Medio | Diagrama de estados como fuente de verdad, tests para cada transicion |
| Permisos de CR confusos (quien puede hacer que) | Media | Medio | Tabla de permisos clara en documentacion |

---
---

# SPRINT 12: Portal Cliente - Visibilidad de Fases & Cobranza

| Campo | Detalle |
|-------|---------|
| **Sprint** | 12 de 14 |
| **Fase** | Fase 10 - Portal de Cliente (Parte 1) |
| **Inicio** | 14 de julio 2026 (lunes) |
| **Deadline** | 25 de julio 2026 (viernes) |
| **Objetivo** | Vista del cliente con progreso de fases, hitos de pago y estado de facturacion |
| **User Stories** | US-13 (Visibilidad de Fases), US-14 (Gestion de Cobranza) |

### Alcance

Primer sprint dedicado exclusivamente al portal de cliente. Se construye el layout diferenciado, las vistas de progreso por fase y el sistema de cobranza con hitos de pago. El cliente tendra una experiencia visual distinta al admin, mas simple y enfocada en su inversion.

### Wireframe de la Vista Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo Cliente]     Mis Proyectos     Pagos     Cambios        │
│                                                    [Notif Bell] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bienvenido, [Nombre del Cliente]                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Proyecto: App Mobile VIVO                               │   │
│  │                                                         │   │
│  │  Progreso General: ████████████░░░░░░  68%              │   │
│  │                                                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Planeacion│ │  Diseno  │ │Desarrollo│ │    QA    │  │   │
│  │  │  100% ✓  │ │  100% ✓  │ │   45%    │ │    0%   │  │   │
│  │  │  [verde] │ │  [verde] │ │ [azul]   │ │  [gris] │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Hitos de Pago                                          │   │
│  │                                                         │   │
│  │  ✓  Anticipo 30%      $15,000    Pagado 15-Mar          │   │
│  │  ⚠  Entrega Diseno    $10,000    Vence 20-Jul           │   │
│  │  ○  Entrega Final     $25,000    Pendiente              │   │
│  │                                                         │   │
│  │  Total: $50,000  |  Pagado: $15,000  |  Pendiente: $35k│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 12.1 | `ClientShell.astro`: layout del portal cliente con branding dinamico (logo, color del tenant) | 4 | P0 | Frontend |
| 12.2 | `ClientSidebar.astro`: navegacion simplificada (Proyectos, Pagos, Cambios, Notificaciones) | 3 | P0 | Frontend |
| 12.3 | API: endpoints para cliente con serializers reducidos (sin datos financieros internos) | 4 | P0 | Backend |
| 12.4 | `ClientProjectOverview.tsx`: barra de progreso general + grid de fases con status visual | 4 | P0 | Frontend |
| 12.5 | `PhaseTimeline.tsx`: timeline horizontal de fases con etapa actual destacada y porcentaje | 4 | P0 | Frontend |
| 12.6 | API: `PaymentMilestoneViewSet` (admin CRUD, cliente solo lectura) | 3 | P0 | Backend |
| 12.7 | `PaymentMilestonesTable.tsx`: tabla con status por color (verde=pagado, amarillo=proximo, rojo=vencido) | 4 | P0 | Frontend |
| 12.8 | `InvoiceStatusCard.tsx`: tarjeta resumen (total proyecto, pagado, pendiente, proximo vencimiento) | 3 | P1 | Frontend |
| 12.9 | Pagina `/client/dashboard`: overview de proyectos del cliente | 3 | P0 | Frontend |
| 12.10 | Pagina `/client/projects/[id]`: detalle con fases y pagos | 3 | P0 | Frontend |
| 12.11 | Tarea Celery: detectar hitos vencidos y proximos (7 dias) para notificaciones | 3 | P1 | Backend |
| 12.12 | Tests: aislamiento de datos (cliente A no ve cliente B), serializers reducidos | 3 | P0 | Backend |

**Total estimado: 41 horas**

### Archivos Entregables

```
frontend/src/
├── components/
│   ├── client-layout/
│   │   ├── ClientShell.astro         ← Layout con branding
│   │   └── ClientSidebar.astro       ← Nav simplificada
│   └── client/
│       ├── ClientProjectOverview.tsx  ← Progreso + fases
│       ├── PhaseTimeline.tsx          ← Timeline visual
│       ├── PaymentMilestonesTable.tsx ← Tabla de pagos
│       └── InvoiceStatusCard.tsx      ← Resumen facturacion
├── hooks/
│   ├── useClientProjects.ts
│   └── usePaymentMilestones.ts
├── types/
│   └── client.ts                     ← Interfaces del portal
└── pages/
    └── client/
        ├── dashboard.astro
        └── projects/
            └── [id].astro

backend/apps/finance/
├── serializers.py                    ← +ClientProjectSerializer (reducido)
├── views.py                          ← +ClientProjectViewSet, +PaymentMilestoneViewSet
└── tasks.py                          ← +check_payment_milestones (Celery)
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-13:** Cliente ve progreso porcentual por fase con visualizacion clara
- [ ] **US-14:** Tabla de hitos muestra status correcto: pagado (verde), proximo (amarillo), vencido (rojo)
- [ ] Layout de cliente es visualmente distinto al admin (logo y color del tenant)
- [ ] Sidebar tiene solo 4 items: Proyectos, Pagos, Cambios, Notificaciones
- [ ] API para cliente NO expone: costos internos, tarifas, horas detalladas, health_score
- [ ] Cliente ve SOLO sus proyectos (filtrado por Organization)
- [ ] InvoiceStatusCard muestra totales correctos
- [ ] Notificacion automatica 7 dias antes de vencimiento de hito de pago
- [ ] Hitos vencidos se marcan automaticamente como "overdue"
- [ ] Responsive: portal funciona en mobile (360px+)

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| UX del portal demasiado compleja para clientes | Media | Alto | Diseno minimalista, feedback temprano |
| Serializer de cliente expone datos financieros accidentalmente | Media | Critico | Tests explicitos verificando que campos internos NO aparecen |
| Branding dinamico complica el CSS | Baja | Bajo | CSS custom properties para colores, logo como imagen |

---
---

# SPRINT 13: Portal Cliente - Requerimientos & Notificaciones

| Campo | Detalle |
|-------|---------|
| **Sprint** | 13 de 14 |
| **Fase** | Fase 11 - Portal de Cliente (Parte 2) |
| **Inicio** | 28 de julio 2026 (lunes) |
| **Deadline** | 8 de agosto 2026 (viernes) |
| **Objetivo** | Sistema de requerimientos del cliente, solicitudes de cambio desde portal, notificaciones unificadas |
| **User Stories** | US-15 (Requerimientos), US-16 (Notificaciones Unificadas) |

### Alcance

Sprint que cierra las funcionalidades del portal de cliente. Incluye el sistema de gestion de requerimientos pendientes (para evitar cuellos de botella), la vista de solicitudes de cambio desde la perspectiva del cliente, y un sistema de notificaciones unificado que funciona para ambos tenants.

### Flujo de Requerimientos del Cliente

```
┌─────────────┐                  ┌─────────────┐                  ┌─────────────┐
│ PM crea     │                  │ Cliente ve  │                  │ PM verifica │
│ requerimiento│─── Notificacion ─>│ pendiente  │─── Marca como ──>│ entrega     │
│ pendiente   │     al cliente   │ en su portal│   "entregado"   │             │
└─────────────┘                  └─────────────┘                  └──────┬──────┘
                                                                         │
                                                                         v
                                                                  ┌─────────────┐
                                                                  │  VERIFICADO │
                                                                  │  (cerrado)  │
                                                                  └─────────────┘
```

### Sistema de Notificaciones Unificado

```
┌─────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION CENTER                            │
│                                                                 │
│  Triggers automaticos:                                          │
│  ┌───────────────────────────────┬─────────────────────────┐   │
│  │ Evento                        │ Destinatario            │   │
│  ├───────────────────────────────┼─────────────────────────┤   │
│  │ Proyecto entra en CRITICAL    │ PM + Director           │   │
│  │ Hito de pago en 7 dias       │ Cliente + PM            │   │
│  │ Hito de pago vencido         │ Cliente + PM + Director │   │
│  │ CR creado por cliente        │ PM asignado             │   │
│  │ CR cotizado por PM           │ Cliente solicitante     │   │
│  │ CR aprobado/rechazado        │ PM + Cliente            │   │
│  │ Requerimiento creado         │ Cliente                 │   │
│  │ Requerimiento entregado      │ PM                      │   │
│  │ Requerimiento vencido        │ Cliente + PM            │   │
│  └───────────────────────────────┴─────────────────────────┘   │
│                                                                 │
│  Canales:                                                       │
│  - In-app (NotificationBell) -> Siempre activo                 │
│  - Email (Django send_mail) -> Opcional, configurable           │
└─────────────────────────────────────────────────────────────────┘
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 13.1 | API: `ClientRequirementViewSet` (admin CRUD, cliente marca entregado) | 3 | P0 | Backend |
| 13.2 | `ClientRequirementsPanel.tsx`: lista de pendientes con status, fecha limite, accion "Entregar" | 4 | P0 | Frontend |
| 13.3 | `ClientChangeRequestForm.tsx`: formulario simplificado para que cliente solicite cambios | 4 | P0 | Frontend |
| 13.4 | `ClientChangeRequestsList.tsx`: vista de CRs con status actual y timeline resumido | 3 | P0 | Frontend |
| 13.5 | Pagina `/client/requirements` - pendientes del cliente | 2 | P0 | Frontend |
| 13.6 | Pagina `/client/change-requests` - solicitudes de cambio | 2 | P0 | Frontend |
| 13.7 | Modelo `Notification`: FK User (dest.) + tipo + titulo + mensaje + is_read + FK related_object | 4 | P0 | Backend |
| 13.8 | Servicio `NotificationService`: create_notification() con dispatch a in-app + email opcional | 3 | P0 | Backend |
| 13.9 | Triggers: conectar los 9 eventos de la tabla anterior a NotificationService (signals o manual) | 4 | P0 | Backend |
| 13.10 | `NotificationCenter.tsx`: componente reutilizable para ambos tenants (bell + dropdown + pagina) | 3 | P0 | Frontend |
| 13.11 | Hook `useNotifications()`: polling 30s, mark-as-read, con filtro por tenant | 2 | P0 | Frontend |
| 13.12 | Email notifications via Django `send_mail` (configurable, desactivable) | 3 | P1 | Backend |
| 13.13 | Pagina `/client/notifications` - historial completo | 2 | P1 | Frontend |
| 13.14 | Tests: triggers generan notificaciones correctas, email enviado si configurado | 3 | P0 | Backend |

**Total estimado: 42 horas**

### Archivos Entregables

```
backend/apps/
├── notifications/                      ← NUEVA APP
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py                       ← Notification
│   ├── services.py                     ← NotificationService
│   ├── triggers.py                     ← 9 triggers conectados a eventos
│   ├── serializers.py
│   ├── views.py                        ← NotificationViewSet
│   ├── urls.py
│   └── tests/
│       └── test_triggers.py

frontend/src/
├── components/
│   ├── client/
│   │   ├── ClientRequirementsPanel.tsx
│   │   ├── ClientChangeRequestForm.tsx
│   │   └── ClientChangeRequestsList.tsx
│   └── notifications/
│       └── NotificationCenter.tsx      ← Reutilizable admin + client
├── hooks/
│   ├── useClientRequirements.ts
│   └── useNotifications.ts
└── pages/
    └── client/
        ├── requirements.astro
        ├── change-requests.astro
        └── notifications.astro
```

### Criterios de Aceptacion (Definition of Done)

- [ ] **US-15:** Cliente ve lista de pendientes con fecha limite y puede marcar como "entregado"
- [ ] **US-16:** NotificationCenter funciona para ambos tenants con polling 30s
- [ ] PM recibe notificacion cuando cliente entrega un requerimiento
- [ ] Cliente recibe notificacion cuando PM cotiza un CR
- [ ] 9 triggers generan notificaciones automaticamente
- [ ] Email optional: si SMTP configurado, envia; sino, solo in-app
- [ ] Cliente puede crear CRs desde formulario simplificado (sin campos de cotizacion)
- [ ] Timeline de CR visible para cliente (sin mostrar costos internos)
- [ ] Requerimientos vencidos se resaltan en rojo con notificacion
- [ ] Mark-as-read funciona en dropdown y en pagina de historial

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Exceso de notificaciones "spamea" al usuario | Alta | Medio | Configuracion de frecuencia, agrupacion de notifs similares |
| SMTP no disponible en produccion | Media | Bajo | Email es opcional, in-app siempre funciona |
| Triggers con side-effects lentos en request | Media | Medio | Usar signals o dispatch async (Celery task) |

---
---

# SPRINT 14: QA Integral, UAT Cliente & Deploy Release 2

| Campo | Detalle |
|-------|---------|
| **Sprint** | 14 de 14 (FINAL) |
| **Fase** | Lanzamiento Release 2 |
| **Inicio** | 11 de agosto 2026 (lunes) |
| **Deadline** | 22 de agosto 2026 (viernes) |
| **Objetivo** | Sistema multi-tenant probado E2E, validado con cliente real, desplegado en produccion |
| **User Stories** | Verificacion de todas las US R2 (US-09 a US-16) |

### Alcance

Sprint final del proyecto. Incluye testing E2E de ambos tenants funcionando simultaneamente, tests de seguridad multi-tenant, sesion UAT con un cliente real de Appix, y deploy a produccion del Release 2.

### Flujos E2E a Verificar

```
FLUJO 1: Ciclo de vida del proyecto (admin + cliente)
  Admin crea proyecto + asigna Organization cliente
  -> Cliente hace login y ve su proyecto
  -> Sync Clockify actualiza progreso
  -> Cliente ve fases avanzar en su portal
  -> Admin ve salud financiera en su dashboard

FLUJO 2: Gestion de cobranza
  Admin crea hitos de pago para proyecto
  -> Cliente ve hitos en su portal
  -> 7 dias antes de vencimiento: notificacion automatica
  -> Admin marca hito como "pagado"
  -> Cliente ve status actualizado

FLUJO 3: Solicitud de cambio de alcance
  Cliente crea CR desde su portal (DRAFT -> SUBMITTED)
  -> PM recibe notificacion
  -> PM cotiza: agrega horas y costo (QUOTED)
  -> Cliente recibe notificacion de cotizacion
  -> Cliente aprueba (APPROVED)
  -> budget_hours del proyecto se incrementa automaticamente
  -> Triple Axis recalcula salud con nuevo presupuesto
  -> PM marca como completado (COMPLETED)

FLUJO 4: Gestion de requerimientos
  PM crea requerimiento pendiente para cliente
  -> Cliente recibe notificacion
  -> Cliente sube entregable y marca "entregado"
  -> PM recibe notificacion y verifica

FLUJO 5: Seguridad multi-tenant
  Cliente A hace login -> ve solo sus proyectos
  Cliente A intenta acceder a URL de proyecto de Cliente B -> 403
  Admin hace login -> ve todos los proyectos
  API responses de cliente NO contienen datos financieros internos
```

### Backlog del Sprint

| ID | Tarea | Horas | Prioridad | Responsable |
|----|-------|-------|-----------|-------------|
| 14.1 | E2E Flujo 1: ciclo de vida proyecto admin + cliente | 3 | P0 | QA |
| 14.2 | E2E Flujo 2: cobranza completa con notificaciones | 3 | P0 | QA |
| 14.3 | E2E Flujo 3: CR completo con ajuste de presupuesto | 3 | P0 | QA |
| 14.4 | E2E Flujo 4: requerimientos con notificaciones | 2 | P0 | QA |
| 14.5 | E2E Flujo 5: tests de seguridad multi-tenant exhaustivos | 4 | P0 | Backend + QA |
| 14.6 | Corregir bugs de integracion (buffer) | 6 | P0 | Backend + Frontend |
| 14.7 | Sesion UAT con cliente real de Appix (preparar datos de demo + ejecutar) | 4 | P0 | PO + QA |
| 14.8 | Corregir feedback critico de UAT | 6 | P0 | Backend + Frontend |
| 14.9 | Actualizar `docker-compose.prod.yml`: nuevas apps, migraciones, env vars | 2 | P0 | DevOps |
| 14.10 | Ejecutar migraciones en produccion (backup previo obligatorio) | 2 | P0 | DevOps |
| 14.11 | Deploy Release 2 a produccion | 3 | P0 | DevOps |
| 14.12 | Crear usuarios de cliente en produccion (Organizations + UserProfiles) | 1 | P0 | Admin |
| 14.13 | Verificacion post-deploy: ambos tenants funcionales simultaneamente | 2 | P0 | QA |
| 14.14 | Documentacion de uso para clientes (guia basica PDF o pagina) | 2 | P1 | PO |

**Total estimado: 43 horas**

### Checklist de Verificacion por User Story (Release 2)

| US | Titulo | Status |
|----|--------|--------|
| US-09 | Roles multi-tenant (Admin vs Cliente) | [ ] Verificado |
| US-10 | Aislamiento de datos por Organization | [ ] Verificado |
| US-11 | Flujo de solicitudes de cambio | [ ] Verificado |
| US-12 | Ajuste automatico de presupuesto | [ ] Verificado |
| US-13 | Visibilidad de fases para cliente | [ ] Verificado |
| US-14 | Gestion de cobranza (hitos de pago) | [ ] Verificado |
| US-15 | Requerimientos pendientes del cliente | [ ] Verificado |
| US-16 | Notificaciones unificadas | [ ] Verificado |

### Criterios de Aceptacion (Definition of Done)

- [ ] Los 5 flujos E2E pasan sin errores
- [ ] Tests de seguridad: 0 fugas de datos entre tenants
- [ ] API de cliente NO expone campos: cost, hourly_rate, health_score, margin
- [ ] Cliente real aprueba el portal en sesion UAT (minimo 4/5 flujos aprobados)
- [ ] Feedback critico corregido e incorporado
- [ ] Migraciones ejecutadas en produccion sin errores (con backup)
- [ ] Ambos tenants (admin + cliente) funcionales simultaneamente en produccion
- [ ] Notificaciones funcionan en produccion (in-app; email si SMTP configurado)
- [ ] Documentacion de uso entregada al cliente
- [ ] Release 1 sigue funcionando identicamente (no regresiones)

### Dependencias Externas (BLOQUEANTES)

| Dependencia | Estado | Responsable | Fecha limite |
|-------------|--------|-------------|-------------|
| Cliente real disponible para UAT | Pendiente | Product Owner | 4 Ago 2026 |
| Datos de demo preparados en produccion | Pendiente | QA + PO | 11 Ago 2026 |
| SMTP configurado (si se activa email) | Pendiente | DevOps | 11 Ago 2026 |
| Subdominio cliente (ej. portal.appix.com) | Pendiente | DevOps | 11 Ago 2026 |

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Feedback de cliente requiere rediseno de UX | Media | Alto | Priorizar solo feedback critico, diferir estetico |
| Migraciones en produccion corrompen datos R1 | Baja | Critico | Backup completo antes de migrar, rollback plan |
| Regresion en funcionalidad R1 | Media | Alto | Suite de tests R1 debe pasar al 100% antes de deploy |
| Deploy con downtime | Media | Medio | Blue-green deployment o maintenance window programada |

---
---

# APENDICES

## A. Resumen de Horas por Sprint

### Release 1: Dashboard Administrativo

| Sprint | Horas Estimadas | Tipo de Trabajo |
|--------|----------------|-----------------|
| Sprint 1 | 26h | Backend + Frontend (config) |
| Sprint 2 | 29h | Backend (modelos + logica) |
| Sprint 3 | 33h | Backend (integraciones) |
| Sprint 4 | 29h | Backend (API) |
| Sprint 5 | 28h | Frontend (datos) |
| Sprint 6 | 43h | Frontend (visual) |
| Sprint 7 | 30h | Frontend (paginas) + Backend (reportes) |
| Sprint 8 | 33h | QA + Fixes |
| Sprint 9 | 35h | UAT + Deploy |
| **Subtotal R1** | **286h** | |

### Release 2: Portal de Cliente

| Sprint | Horas Estimadas | Tipo de Trabajo |
|--------|----------------|-----------------|
| Sprint 10 | 39h | Backend (multi-tenant, modelos) |
| Sprint 11 | 45h | Full-stack (change requests) |
| Sprint 12 | 41h | Full-stack (portal cliente P1) |
| Sprint 13 | 42h | Full-stack (portal cliente P2) |
| Sprint 14 | 43h | QA + UAT + Deploy |
| **Subtotal R2** | **210h** | |

| | | |
|--------|----------------|-----------------|
| **TOTAL PROYECTO** | **496h** | |

## B. Distribucion de Trabajo por Rol

| Rol | Sprints Principales | Horas Estimadas |
|-----|--------------------|-----------------|
| Backend Developer | Sprints 1-4, 7 (reportes), 8-11, 13 | ~250h |
| Frontend Developer | Sprints 1, 5-7 (paginas), 8-9, 11-13 | ~210h |
| QA / Testing | Sprints 2, 3, 8-9, 14 | ~60h |
| DevOps | Sprints 9, 14 | ~25h |
| Product Owner | Sprints 9, 14 (UATs) | ~16h |

## C. Dependencias Criticas - Timeline

```
RELEASE 1
─────────
10 Feb ──── Sprint 1 ────────────────────────── Sin dependencias externas
24 Feb ──── Sprint 2 ────────────────────────── Sin dependencias externas
10 Mar ──── Sprint 3 ──── API Keys Clockify ─── BLOQUEANTE
                     ──── API Token Jira ────── BLOQUEANTE
24 Mar ──── Sprint 4 ────────────────────────── Sin dependencias externas
07 Abr ──── Sprint 5 ────────────────────────── Sin dependencias externas
21 Abr ──── Sprint 6 ────────────────────────── Sin dependencias externas
05 May ──── Sprint 7 ────────────────────────── Sin dependencias externas
19 May ──── Sprint 8 ────────────────────────── Sin dependencias externas
02 Jun ──── Sprint 9 ──── Servidor produccion ─ BLOQUEANTE
                     ──── Sesion UAT agendada ─ BLOQUEANTE
15 Jun ──── ENTREGA RELEASE 1

RELEASE 2
─────────
16 Jun ──── Sprint 10 ───────────────────────── Sin dependencias externas
30 Jun ──── Sprint 11 ───────────────────────── Sin dependencias externas
14 Jul ──── Sprint 12 ──── Branding de cliente ─ DESEABLE
28 Jul ──── Sprint 13 ──── SMTP configurado ─── DESEABLE (para email)
11 Ago ──── Sprint 14 ──── Cliente real UAT ─── BLOQUEANTE
                      ──── Subdominio portal ── BLOQUEANTE
22 Ago ──── ENTREGA RELEASE 2
```

## D. Definicion de Prioridades

| Prioridad | Significado | Accion si no se completa |
|-----------|------------|--------------------------|
| **P0** | Critico - Sin esto el sprint fracasa | Sprint no se puede cerrar |
| **P1** | Importante - Necesario para el producto | Se arrastra al siguiente sprint |
| **P2** | Deseable - Mejora calidad/UX | Se descarta o posterga |

## E. Ceremonias Scrum

| Ceremonia | Cuando | Duracion | Participantes |
|-----------|--------|----------|---------------|
| Sprint Planning | Primer lunes del sprint | 2h | Todo el equipo |
| Daily Standup | Cada dia laboral | 15min | Todo el equipo |
| Sprint Review (Demo) | Ultimo viernes del sprint | 1h | Equipo + Stakeholders |
| Sprint Retrospective | Ultimo viernes del sprint | 30min | Solo equipo |

## F. Contactos y Responsables

| Rol | Responsabilidad |
|-----|----------------|
| Product Owner | Prioridad de backlog, criterios de aceptacion, UAT (R1 + R2) |
| Scrum Master | Facilitacion, impedimentos, metricas |
| Backend Lead | Arquitectura Django, API, integraciones, multi-tenant |
| Frontend Lead | Arquitectura Astro/React, componentes, portal cliente |
| QA Lead | Tests E2E, seguridad multi-tenant, accesibilidad |
| DevOps | Docker, deploy, monitoring, SMTP |

## G. Metricas de Impacto (Post-Lanzamiento)

Alineadas con la vision estrategica del proyecto:

| Metrica | Objetivo | Como se mide | Release |
|---------|----------|-------------|---------|
| Proyectos con margen protegido | 100% | Triple Axis: 0 proyectos CRITICAL sin alerta | R1 |
| Tiempo de deteccion de desviacion | < 1 hora | Celery Beat sync hourly | R1 |
| Satisfaccion del cliente | >= 80% | Encuesta NPS post-R2 | R2 |
| Adopcion del portal cliente | >= 70% | Logins unicos / mes | R2 |
| Change Requests en plataforma | >= 90% | CRs en sistema vs fuera | R2 |
| Reduccion de cuellos de botella | >= 50% | Requerimientos entregados a tiempo | R2 |

## H. Glosario

| Termino | Definicion |
|---------|-----------|
| **Triple Axis Varianza** | Logica de evaluacion de salud: Consumo, Progreso y Desviacion |
| **Tenant** | Entidad aislada (Organization) con sus propios datos y usuarios |
| **Change Request (CR)** | Solicitud de cambio de alcance de un proyecto |
| **Health Score** | Puntuacion 0-100 calculada por Triple Axis |
| **Semaforo** | Indicador visual: CRITICAL (rojo), WARNING (amarillo), HEALTHY (verde) |
| **Hito de Pago** | Fecha y monto acordado para cobro al cliente |
| **Requerimiento** | Tarea o insumo pendiente que el cliente debe entregar |
| **Isla (Island)** | Componente React interactivo montado con `client:load` en Astro |
