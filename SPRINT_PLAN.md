# Plan de Sprints - Plataforma de Gestion de Proyectos Appix

**Fecha de inicio:** 10 de febrero 2026
**Fecha objetivo Release 1 (Admin):** 15 de junio 2026
**Fecha objetivo Release 2 (Cliente):** 22 de agosto 2026
**Duracion de sprint:** 2 semanas
**Total de sprints:** 14
**Metodologia:** Scrum con sprints de 2 semanas

---

## Estructura del Proyecto

La plataforma se divide en **2 releases** correspondientes a los 2 tenants:

```
RELEASE 1 - Dashboard Administrativo (Sprints 1-9)
  Audiencia: PMs, Directores, equipo interno Appix
  Entrega: 15 junio 2026

RELEASE 2 - Portal de Cliente (Sprints 10-14)
  Audiencia: Clientes externos de Appix
  Entrega: 22 agosto 2026
```

---

## Resumen Ejecutivo

### Release 1: Dashboard Administrativo (Feb - Jun 2026)

| Sprint | Nombre | Fases | Inicio | Fin (Deadline) |
|--------|--------|-------|--------|----------------|
| 1 | Infraestructura & Scaffolding | Fase 0 | 10 Feb 2026 | 21 Feb 2026 |
| 2 | Modelos de Datos & Logica de Negocio | Fase 1 | 24 Feb 2026 | 07 Mar 2026 |
| 3 | Integraciones Clockify & Jira | Fase 2 | 10 Mar 2026 | 21 Mar 2026 |
| 4 | API REST Completa | Fase 3 | 24 Mar 2026 | 04 Abr 2026 |
| 5 | Frontend: Tipos, Servicios & Hooks | Fase 4 | 07 Abr 2026 | 18 Abr 2026 |
| 6 | Frontend: Componentes Visuales | Fase 5 | 21 Abr 2026 | 02 May 2026 |
| 7 | Frontend: Paginas & Reportes | Fases 6 + 7 | 05 May 2026 | 16 May 2026 |
| 8 | Integracion E2E, QA & Pulido | Testing & Fixes | 19 May 2026 | 30 May 2026 |
| 9 | UAT, Performance & Deploy R1 | Lanzamiento R1 | 02 Jun 2026 | 13 Jun 2026 |

**Entrega Release 1:** 15 de junio 2026 (2 dias de buffer)

### Release 2: Portal de Cliente + Gestion de Cambios (Jun - Ago 2026)

| Sprint | Nombre | Fases | Inicio | Fin (Deadline) |
|--------|--------|-------|--------|----------------|
| 10 | Multi-Tenant Auth & Modelos de Cliente | Fase 8 | 16 Jun 2026 | 27 Jun 2026 |
| 11 | Gestion de Cambios de Alcance | Fase 9 | 30 Jun 2026 | 11 Jul 2026 |
| 12 | Portal Cliente: Visibilidad & Cobranza | Fase 10 | 14 Jul 2026 | 25 Jul 2026 |
| 13 | Portal Cliente: Requerimientos & Notificaciones | Fase 11 | 28 Jul 2026 | 08 Ago 2026 |
| 14 | QA Integral, UAT Cliente & Deploy R2 | Lanzamiento R2 | 11 Ago 2026 | 22 Ago 2026 |

**Entrega Release 2:** 22 de agosto 2026

---

## Sprint 1: Infraestructura & Scaffolding

**Fecha:** 10 Feb - 21 Feb 2026
**Fase:** 0 - Infraestructura
**Objetivo:** Base del monorepo funcional con todos los servicios Docker arrancando correctamente.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 1.1 | Crear `docker-compose.yml` con 6 servicios (postgres, redis, django, celery-worker, celery-beat, astro-dev) | 4h | Alta |
| 1.2 | Configurar `.env.example` y `.gitignore` | 1h | Alta |
| 1.3 | Backend: `Dockerfile`, `requirements.txt`, proyecto Django (`core/`) | 4h | Alta |
| 1.4 | Backend: `settings.py` con PostgreSQL, Celery, CORS, DRF config | 4h | Alta |
| 1.5 | Backend: `celery.py`, `urls.py`, `wsgi.py` | 2h | Alta |
| 1.6 | Frontend: `package.json`, `Dockerfile`, `astro.config.mjs`, `tsconfig.json` | 4h | Alta |
| 1.7 | Frontend: `tailwind.config.mjs` con Design System tokens | 2h | Alta |
| 1.8 | Frontend: `global.css` con Tailwind directives | 1h | Media |
| 1.9 | Verificar `docker-compose up` exitoso (6 servicios healthy) | 2h | Alta |
| 1.10 | Documentar setup en README para el equipo | 2h | Baja |

### Criterios de Aceptacion
- [ ] `docker-compose up` levanta 6 servicios sin errores
- [ ] Django accesible en `localhost:8001/admin/`
- [ ] Astro accesible en `localhost:4321/`
- [ ] Celery worker y beat reportan "ready"
- [ ] PostgreSQL y Redis responden a healthchecks

### Riesgos
- Conflictos de puertos con otros proyectos Docker locales
- Dependencias de sistema para WeasyPrint (libcairo2, libpango)

---

## Sprint 2: Modelos de Datos & Logica de Negocio

**Fecha:** 24 Feb - 07 Mar 2026
**Fase:** 1 - Modelos + Logica de Negocio
**Objetivo:** 7 modelos de datos, servicio Triple Axis Varianza funcional con tests unitarios.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 2.1 | Crear app `finance` con 7 modelos: Project, Phase, BillingRole, ProjectRoleRate, TimeEntry, HealthSnapshot, ProjectHealthAlert | 6h | Alta |
| 2.2 | Migraciones y validacion de esquema en PostgreSQL | 2h | Alta |
| 2.3 | Implementar `TripleAxisService` con 6 metodos estaticos | 6h | Alta |
| 2.4 | Configurar Django Admin con semaforos de salud, inlines para Phase y ProjectRoleRate | 4h | Media |
| 2.5 | Escribir tests unitarios: escenario Gherkin (85h consumidas / 40% progreso -> CRITICAL) | 4h | Alta |
| 2.6 | Tests de edge cases: 0%, division por cero, limites de umbrales | 3h | Alta |
| 2.7 | Crear app `integrations` con modelo SyncLog | 2h | Media |
| 2.8 | Crear app `reports` con scaffolding basico | 1h | Baja |
| 2.9 | Seed data: crear proyecto de prueba via Admin | 1h | Media |

### Criterios de Aceptacion
- [ ] 7 modelos migrados correctamente en PostgreSQL
- [ ] `TripleAxisService.evaluate_health()` retorna estados correctos para todos los umbrales
- [ ] 10+ tests unitarios pasando (pytest)
- [ ] Admin muestra semaforos de color por estado de salud
- [ ] Escenario Gherkin del PRD (85h/40% -> CRITICAL) verificado

### Riesgos
- Precision de Decimal en calculos de porcentaje
- Logica de umbrales ambigua en zonas grises (entre 50%-65%)

---

## Sprint 3: Integraciones Clockify & Jira

**Fecha:** 10 Mar - 21 Mar 2026
**Fase:** 2 - Integraciones
**Objetivo:** Sincronizacion automatica con Clockify y Jira, evaluacion de salud periodica via Celery.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 3.1 | Implementar `ClockifyClient`: fetch_projects, fetch_time_entries, fetch_users con paginacion | 6h | Alta |
| 3.2 | Implementar `ClockifySyncService`: upsert TimeEntries, mapeo Tags->Phases, calculo de costos | 6h | Alta |
| 3.3 | Implementar `JiraClient`: fetch_project_progress (story points done/total) | 4h | Alta |
| 3.4 | Configurar 3 tareas Celery: sync_clockify (:00), sync_jira (:05), evaluate_health (:10) | 4h | Alta |
| 3.5 | Endpoint POST sync manual + GET sync status | 3h | Media |
| 3.6 | Tests con mocks de APIs externas (Clockify y Jira) | 4h | Alta |
| 3.7 | Test de upsert (no duplicar TimeEntries existentes) | 2h | Alta |
| 3.8 | Test de calculo de costo con override de tarifa por proyecto | 2h | Media |
| 3.9 | Verificar Celery Beat ejecuta tareas segun schedule | 2h | Media |

### Criterios de Aceptacion
- [ ] Sync de Clockify crea TimeEntries con costos correctos
- [ ] Sync de Jira obtiene progreso como porcentaje decimal
- [ ] Evaluacion de salud genera HealthSnapshot y actualiza Project.current_health_status
- [ ] Alertas solo se generan en CAMBIO de estado (no repetidas)
- [ ] SyncLog registra cada sincronizacion con status y conteo
- [ ] Celery Beat ejecuta las 3 tareas en el schedule correcto

### Riesgos
- APIs de Clockify/Jira pueden cambiar o estar caidas
- Rate limiting de APIs externas
- Mapeo incorrecto de Tags de Clockify a Phases del sistema

### Dependencias Externas
- Acceso a API keys de Clockify (workspace)
- Acceso a API token de Jira (proyecto configurado)

---

## Sprint 4: API REST Completa

**Fecha:** 24 Mar - 04 Abr 2026
**Fase:** 3 - API REST
**Objetivo:** Todos los endpoints REST funcionales y documentados, datos financieros accesibles para el frontend.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 4.1 | Serializers: ProjectList, ProjectDetail, BurndownPoint, PhaseComparison, Portfolio, Alert, BillingRole | 6h | Alta |
| 4.2 | ViewSet de Projects: lista paginada, detalle, filtro por health_status | 4h | Alta |
| 4.3 | Endpoints de datos de graficas: burndown, phase-comparison, health-history | 4h | Alta |
| 4.4 | Endpoint portfolio: vista optimizada con semaforo por proyecto | 3h | Alta |
| 4.5 | ViewSet de Alerts: GET con filtros + PATCH marcar como leida | 3h | Alta |
| 4.6 | ViewSet de BillingRoles: CRUD completo | 2h | Media |
| 4.7 | Configurar paginacion, filtros y ordering globales en DRF | 2h | Media |
| 4.8 | Tests de integracion de endpoints con datos reales | 4h | Alta |
| 4.9 | Verificar que todos los Decimal se serializan como string | 1h | Alta |

### Criterios de Aceptacion
- [ ] `GET /api/v1/finance/projects/` retorna lista paginada con campos calculados
- [ ] `GET /api/v1/finance/projects/{id}/burndown/` retorna serie temporal correcta
- [ ] `GET /api/v1/finance/portfolio/` retorna resumen con semaforos
- [ ] `PATCH /api/v1/finance/alerts/{id}/` marca alerta como leida
- [ ] CRUD completo de billing-roles funcional
- [ ] Todos los valores Decimal llegan como string al frontend
- [ ] Agregaciones ejecutadas en Python/SQL (annotate, aggregate)

### Riesgos
- Performance de queries con muchos TimeEntries
- N+1 queries en serializers anidados

---

## Sprint 5: Frontend - Tipos, Servicios & Hooks

**Fecha:** 07 Abr - 18 Abr 2026
**Fase:** 4 - Frontend Datos
**Objetivo:** Capa de datos del frontend completa: tipos TypeScript, validacion Zod, cliente API y hooks de React Query.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 5.1 | Interfaces TypeScript: 13 tipos (Project, ProjectDetail, Phase, BillingRole, etc.) | 3h | Alta |
| 5.2 | Tipos de API: PaginatedResponse<T>, ApiError | 1h | Alta |
| 5.3 | Esquemas Zod: 10 schemas que validan respuestas del backend | 4h | Alta |
| 5.4 | Cliente Axios: baseURL, withCredentials, interceptores snake_case <-> camelCase | 3h | Alta |
| 5.5 | Funciones API tipadas: fetchProjects, fetchBurndown, etc. + validacion Zod | 4h | Alta |
| 5.6 | Formatters: formatCurrency, formatPercent, formatHours, getHealthColor | 2h | Media |
| 5.7 | Hooks React Query: useProjects, useProjectDetail | 2h | Alta |
| 5.8 | Hooks React Query: useBurndown, usePhaseComparison, useHealthHistory | 3h | Alta |
| 5.9 | Hooks React Query: usePortfolio, useAlerts (polling 30s), useBillingRoles (CRUD) | 3h | Alta |
| 5.10 | QueryProvider wrapper component | 1h | Alta |
| 5.11 | Verificar TypeScript strict mode: cero `any`, cero errores de tipos | 2h | Alta |

### Criterios de Aceptacion
- [ ] `npm run typecheck` pasa sin errores
- [ ] Todas las respuestas del backend son validadas con Zod antes de renderizar
- [ ] Interceptores transforman snake_case <-> camelCase correctamente
- [ ] useAlerts hace polling cada 30 segundos
- [ ] Mutations de BillingRoles invalidan cache automaticamente
- [ ] Cero uso de `any` en todo el codigo TypeScript

### Riesgos
- Desincronizacion entre tipos TS y respuestas reales del backend
- Transformacion camelCase puede fallar en campos anidados profundos

---

## Sprint 6: Frontend - Componentes Visuales

**Fecha:** 21 Abr - 02 May 2026
**Fase:** 5 - Componentes Visuales
**Objetivo:** Todos los componentes React (atomicos, charts, compuestos) implementados y estilizados segun Design System.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 6.1 | Layout Astro: DashboardShell, Sidebar, PageHeader | 4h | Alta |
| 6.2 | Atomicos: StatusBadge, MetricCard, AlertBanner | 3h | Alta |
| 6.3 | AlertNotificationBell con badge + dropdown (US-07) | 3h | Alta |
| 6.4 | FinancialBurndownChart: LineChart 3 lineas + toggle tabla (US-04) | 5h | Alta |
| 6.5 | PhaseComparisonChart: BarChart estimado vs actual + toggle tabla (US-06) | 4h | Alta |
| 6.6 | HealthGaugeChart: RadialBarChart con score central | 3h | Media |
| 6.7 | HealthTrendChart: AreaChart con gradiente historico | 3h | Media |
| 6.8 | TableViewToggle + AccessibleDataTable (WCAG AA) | 3h | Alta |
| 6.9 | TripleAxisCard: composicion de MetricCards + PhaseComparison + AlertBanner | 3h | Alta |
| 6.10 | PortfolioTable: tabla ordenable/filtrable con semaforos (US-05) | 4h | Alta |
| 6.11 | BillingRolesManager: tabla editable CRUD (US-03) | 4h | Alta |
| 6.12 | ProjectDashboard: grid completo de detalle de proyecto | 4h | Alta |

### Criterios de Aceptacion
- [ ] Todos los componentes usan tokens del Design System (critical, warning, healthy)
- [ ] Graficas tienen toggle Grafico/Tabla para accesibilidad (WCAG AA)
- [ ] PortfolioTable es ordenable por columnas y filtrable por estado
- [ ] BillingRolesManager permite crear, editar y eliminar tarifas inline
- [ ] Numeros financieros usan clase `tabular-nums` para alineacion
- [ ] Responsive: funciona en desktop (1280px+) y tablet (768px+)

### Riesgos
- Performance de Recharts con muchos data points
- Accesibilidad (WCAG AA) en componentes interactivos complejos

---

## Sprint 7: Paginas Astro & Reportes

**Fecha:** 05 May - 16 May 2026
**Fases:** 6 (Paginas) + 7 (Reportes)
**Objetivo:** Todas las rutas del frontend funcionales + exportacion PDF y Excel.

### Tareas - Fase 6: Paginas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 7.1 | `pages/index.astro` - Dashboard home con PortfolioTable + AlertBell | 2h | Alta |
| 7.2 | `pages/projects/[id].astro` - Detalle de proyecto con ProjectDashboard | 3h | Alta |
| 7.3 | `pages/portfolio.astro` - Vista de portfolio completa | 2h | Alta |
| 7.4 | `pages/billing-roles.astro` - Gestion de tarifas | 2h | Media |
| 7.5 | `pages/alerts.astro` - Historial de alertas | 2h | Media |
| 7.6 | Montar todos los componentes React como islas con `client:load` | 1h | Alta |

### Tareas - Fase 7: Reportes

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 7.7 | Template HTML/CSS para PDF A4 (portada, resumen, tablas) | 4h | Alta |
| 7.8 | `pdf_generator.py` con WeasyPrint: resumen ejecutivo, tabla de fases, time entries | 4h | Alta |
| 7.9 | `excel_generator.py` con OpenPyXL: 4 hojas (Resumen, Time Entries, Por Fase, Historico) | 4h | Alta |
| 7.10 | Endpoints: GET .../pdf/ y .../excel/ con FileResponse | 2h | Alta |
| 7.11 | ExportButtons.tsx: botones PDF/Excel con loading state (US-08) | 2h | Alta |
| 7.12 | Verificar PDF genera correctamente con datos reales | 2h | Alta |

### Criterios de Aceptacion
- [ ] Todas las 5 rutas del frontend funcionan y renderizan datos
- [ ] Navegacion desde Sidebar funciona correctamente
- [ ] PDF genera documento A4 valido con datos del proyecto
- [ ] Excel contiene 4 hojas con datos correctos
- [ ] Botones de exportacion muestran loading state durante descarga
- [ ] Pagina de detalle muestra todas las graficas y metricas

### Riesgos
- WeasyPrint puede tener diferencias de renderizado entre OS
- Archivos Excel grandes pueden ser lentos de generar

---

## Sprint 8: Integracion E2E, QA & Pulido

**Fecha:** 19 May - 30 May 2026
**Fase:** Testing & Quality Assurance
**Objetivo:** Sistema completamente integrado, bugs corregidos, tests E2E pasando, performance optimizada.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 8.1 | Flujo E2E completo: crear proyecto -> sync Clockify -> evaluacion -> ver en dashboard | 4h | Alta |
| 8.2 | Verificar pipeline completo: Celery sync -> HealthSnapshot -> Alerta -> Frontend polling | 4h | Alta |
| 8.3 | Corregir bugs encontrados durante integracion | 8h | Alta |
| 8.4 | Optimizar queries N+1 (select_related, prefetch_related) | 3h | Alta |
| 8.5 | Verificar CORS funciona correctamente entre Astro y Django | 2h | Alta |
| 8.6 | Tests de edge cases: proyecto sin time entries, sin phases, sin snapshots | 3h | Media |
| 8.7 | Validar que alertas solo se generan en cambio de estado | 2h | Alta |
| 8.8 | Revisar accesibilidad WCAG AA en todas las paginas | 3h | Media |
| 8.9 | Revisar responsive design en diferentes resoluciones | 2h | Media |
| 8.10 | Limpiar TODOs, console.logs, y codigo dead | 2h | Baja |

### Criterios de Aceptacion
- [ ] Flujo E2E completo funciona sin errores manuales
- [ ] Todos los tests unitarios y de integracion pasan (pytest + typecheck)
- [ ] No hay queries N+1 en endpoints criticos
- [ ] Alertas se generan correctamente solo en cambios de estado
- [ ] Dashboard carga en menos de 3 segundos
- [ ] Sin errores en consola del navegador

### Riesgos
- Bugs de integracion no detectados en fases individuales
- Performance degradada con volumen real de datos

---

## Sprint 9: UAT, Performance & Deploy

**Fecha:** 02 Jun - 13 Jun 2026
**Fase:** Lanzamiento
**Objetivo:** Validacion con usuarios, ajustes finales, deploy a produccion.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 9.1 | Sesion de UAT con stakeholders de Appix | 4h | Alta |
| 9.2 | Corregir feedback de UAT (priorizado) | 8h | Alta |
| 9.3 | Configurar entorno de produccion (Docker Compose prod) | 4h | Alta |
| 9.4 | Configurar variables de entorno de produccion | 2h | Alta |
| 9.5 | Configurar Gunicorn en lugar de runserver | 2h | Alta |
| 9.6 | Build de produccion de Astro (static output) | 2h | Alta |
| 9.7 | Configurar nginx o servicio de archivos estaticos | 3h | Media |
| 9.8 | Test de carga basico: verificar performance con datos reales | 3h | Media |
| 9.9 | Documentacion de operaciones (como hacer sync manual, ver logs, etc.) | 2h | Media |
| 9.10 | Deploy a produccion | 3h | Alta |
| 9.11 | Verificacion post-deploy | 2h | Alta |

### Criterios de Aceptacion
- [ ] Stakeholders aprueban el sistema en sesion UAT
- [ ] Feedback critico de UAT corregido
- [ ] Sistema desplegado en produccion con todos los servicios estables
- [ ] Sync automatico de Clockify y Jira funciona en produccion
- [ ] Dashboard accesible desde la red interna de Appix
- [ ] Documentacion de operaciones entregada

### Riesgos
- Feedback de UAT puede requerir cambios significativos
- Diferencias entre ambiente local y produccion
- Configuracion de red/firewall para APIs externas

---

---

## Sprint 10: Multi-Tenant Auth & Modelos de Cliente

**Fecha:** 16 Jun - 27 Jun 2026
**Fase:** 8 - Arquitectura Multi-Tenant
**Objetivo:** Sistema de autenticacion con roles (Admin/PM/Director vs Cliente), modelos de datos para el portal de cliente.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 10.1 | Modelo `Organization` (tenant): nombre, logo, dominio, plan | 3h | Alta |
| 10.2 | Modelo `UserProfile`: FK User + FK Organization + role (admin/pm/client) | 3h | Alta |
| 10.3 | Modelo `ClientContact`: FK Organization + nombre, email, telefono, is_primary | 2h | Alta |
| 10.4 | Extender modelo `Project` con FK Organization + client_organization | 2h | Alta |
| 10.5 | Middleware de tenant: aislar datos por Organization en cada request | 4h | Alta |
| 10.6 | Permisos DRF: IsAdmin, IsPM, IsClient con acceso granular por endpoint | 4h | Alta |
| 10.7 | Login/Logout views para portal de cliente (session auth) | 3h | Alta |
| 10.8 | Modelo `PaymentMilestone`: FK Project + monto, fecha_vencimiento, status (pendiente/pagado/vencido) | 3h | Alta |
| 10.9 | Modelo `ClientRequirement`: FK Project + descripcion, status (pendiente/entregado), fecha_limite | 3h | Alta |
| 10.10 | Migraciones + tests de permisos (cliente no ve datos de otro cliente) | 4h | Alta |
| 10.11 | Seed data: crear Organization de prueba + usuario cliente | 2h | Media |

### Criterios de Aceptacion
- [ ] Usuario con role=client solo ve proyectos de SU Organization
- [ ] Usuario con role=admin ve TODOS los proyectos
- [ ] Middleware de tenant aisla datos correctamente
- [ ] Login de cliente funciona con session auth
- [ ] Modelos PaymentMilestone y ClientRequirement migrados
- [ ] Tests de permisos: 403 si cliente intenta acceder a datos de otro tenant

### Riesgos
- Refactoring de queries existentes para agregar filtro de tenant
- Migraciones pueden romper datos existentes si no se manejan con cuidado

---

## Sprint 11: Gestion de Cambios de Alcance

**Fecha:** 30 Jun - 11 Jul 2026
**Fase:** 9 - Change Request Management
**Objetivo:** Flujo completo de solicitudes de cambio: desde el request del cliente hasta la aprobacion interna y ajuste de presupuesto.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 11.1 | Modelo `ChangeRequest`: FK Project + titulo, descripcion, status, solicitado_por, horas_estimadas, costo_estimado | 4h | Alta |
| 11.2 | Modelo `ChangeRequestComment`: FK ChangeRequest + autor + mensaje + timestamp | 2h | Alta |
| 11.3 | Status machine: DRAFT -> SUBMITTED -> QUOTED -> APPROVED -> IN_PROGRESS -> COMPLETED / REJECTED | 4h | Alta |
| 11.4 | API: CRUD ChangeRequest + transiciones de status + comentarios | 5h | Alta |
| 11.5 | Logica: al aprobar CR, sumar horas_estimadas al budget_hours del proyecto | 3h | Alta |
| 11.6 | Vista interna (Admin): tabla de CRs pendientes, formulario de cotizacion | 4h | Alta |
| 11.7 | Componente `ChangeRequestTimeline.tsx`: timeline visual del flujo de un CR | 4h | Media |
| 11.8 | Componente `ChangeRequestsTable.tsx`: tabla con filtros por status | 3h | Alta |
| 11.9 | Pagina `/change-requests` en dashboard admin | 2h | Alta |
| 11.10 | Notificaciones: alerta cuando un CR cambia de status | 3h | Media |
| 11.11 | Tests: flujo completo de CR (draft -> approved -> budget updated) | 3h | Alta |

### Criterios de Aceptacion
- [ ] Flujo de estados funciona: DRAFT -> SUBMITTED -> QUOTED -> APPROVED -> IN_PROGRESS -> COMPLETED
- [ ] Al aprobar un CR, el budget_hours del proyecto se incrementa automaticamente
- [ ] Cliente puede crear CRs (status DRAFT/SUBMITTED)
- [ ] PM/Admin puede cotizar (QUOTED) y aprobar/rechazar
- [ ] Comentarios bidireccionales funcionan (cliente y admin)
- [ ] Timeline visual muestra historial de transiciones
- [ ] Notificacion generada en cada cambio de status

### Riesgos
- Logica de estados compleja con muchas transiciones
- Ajuste de budget puede afectar calculos de Triple Axis retroactivamente

---

## Sprint 12: Portal Cliente - Visibilidad de Fases & Cobranza

**Fecha:** 14 Jul - 25 Jul 2026
**Fase:** 10 - Portal de Cliente (Parte 1)
**Objetivo:** Vista del cliente con progreso de fases, hitos de pago y estado de facturacion.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 12.1 | Layout de portal cliente: `ClientShell.astro` + `ClientSidebar.astro` (branding del tenant) | 4h | Alta |
| 12.2 | API: endpoints exclusivos para cliente (solo datos de su Organization) | 4h | Alta |
| 12.3 | `ClientProjectOverview.tsx`: progreso porcentual por fase con barra visual | 4h | Alta |
| 12.4 | `PhaseTimeline.tsx`: timeline visual con fases y etapa actual destacada | 4h | Alta |
| 12.5 | `PaymentMilestonesTable.tsx`: tabla de hitos de pago (proximos, pagados, vencidos) | 4h | Alta |
| 12.6 | API: CRUD PaymentMilestone (admin crea, cliente solo ve) | 3h | Alta |
| 12.7 | `InvoiceStatusCard.tsx`: resumen de facturacion (total, pagado, pendiente) | 3h | Media |
| 12.8 | Pagina `/client/dashboard` - overview de sus proyectos | 3h | Alta |
| 12.9 | Pagina `/client/projects/[id]` - detalle con fases y pagos | 3h | Alta |
| 12.10 | Notificaciones de pago: alerta cuando un hito se acerca a vencimiento (7 dias) | 3h | Media |
| 12.11 | Tests de aislamiento: cliente A no ve datos de cliente B | 2h | Alta |

### Criterios de Aceptacion
- [ ] Cliente ve SOLO sus proyectos al hacer login
- [ ] Progreso porcentual por fase es correcto y actualizado
- [ ] Hitos de pago muestran status: proximo (amarillo), pagado (verde), vencido (rojo)
- [ ] Facturacion muestra totales correctos (total proyecto, pagado, pendiente)
- [ ] Notificacion automatica 7 dias antes de vencimiento de hito
- [ ] Layout de cliente es visualmente distinto al admin (branding)
- [ ] Aislamiento de datos: API retorna 403 si cliente accede a proyecto ajeno

### Riesgos
- UX del portal cliente debe ser mucho mas simple que el admin
- Clientes pueden confundirse con datos financieros detallados

---

## Sprint 13: Portal Cliente - Requerimientos & Notificaciones

**Fecha:** 28 Jul - 08 Ago 2026
**Fase:** 11 - Portal de Cliente (Parte 2)
**Objetivo:** Sistema de requerimientos del cliente, solicitudes de cambio desde el portal, y sistema de notificaciones completo.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 13.1 | `ClientRequirementsPanel.tsx`: lista de pendientes del cliente con status y fecha limite | 4h | Alta |
| 13.2 | API: CRUD ClientRequirement (admin crea, cliente marca como entregado) | 3h | Alta |
| 13.3 | `ClientChangeRequestForm.tsx`: formulario para que el cliente solicite cambios | 4h | Alta |
| 13.4 | `ClientChangeRequestsList.tsx`: vista de CRs del cliente con status actual | 3h | Alta |
| 13.5 | Pagina `/client/requirements` - pendientes del cliente | 2h | Alta |
| 13.6 | Pagina `/client/change-requests` - solicitudes de cambio del cliente | 2h | Alta |
| 13.7 | Sistema de notificaciones unificado: modelo `Notification` (in-app para admin y cliente) | 4h | Alta |
| 13.8 | `NotificationCenter.tsx`: componente de notificaciones para ambos tenants | 3h | Alta |
| 13.9 | Triggers de notificacion: hito de pago proximo, CR actualizado, requerimiento vencido, status de proyecto cambia | 4h | Alta |
| 13.10 | Email notifications (opcional): envio basico via Django send_mail | 3h | Media |
| 13.11 | Pagina `/client/notifications` - historial de notificaciones | 2h | Media |

### Criterios de Aceptacion
- [ ] Cliente puede ver sus pendientes y marcarlos como "entregado"
- [ ] Cliente puede crear solicitudes de cambio con descripcion y archivos
- [ ] Cliente ve el status actual de sus CRs (timeline)
- [ ] Notificaciones in-app funcionan para ambos tenants
- [ ] Triggers generan notificaciones automaticamente en cada evento clave
- [ ] Admin recibe notificacion cuando cliente sube un requerimiento o crea un CR
- [ ] Cliente recibe notificacion cuando PM cotiza o aprueba un CR

### Riesgos
- Volumen de notificaciones puede ser excesivo si no se controla
- Email notifications requiere configurar SMTP en produccion

---

## Sprint 14: QA Integral, UAT Cliente & Deploy Release 2

**Fecha:** 11 Ago - 22 Ago 2026
**Fase:** Lanzamiento Release 2
**Objetivo:** Portal de cliente completamente probado, validado con cliente real, desplegado en produccion.

### Tareas

| # | Tarea | Estimacion | Prioridad |
|---|-------|-----------|-----------|
| 14.1 | E2E: flujo completo admin crea proyecto -> cliente lo ve -> CR -> aprobacion -> budget actualizado | 4h | Alta |
| 14.2 | E2E: flujo de cobranza: admin crea hitos -> cliente ve fechas -> pago registrado | 3h | Alta |
| 14.3 | E2E: flujo de requerimientos: admin crea pendiente -> cliente entrega -> PM verifica | 3h | Alta |
| 14.4 | Tests de seguridad: aislamiento multi-tenant, CSRF, session hijacking | 4h | Alta |
| 14.5 | Corregir bugs de integracion (buffer) | 6h | Alta |
| 14.6 | Sesion UAT con cliente real de Appix | 4h | Alta |
| 14.7 | Corregir feedback critico de UAT | 6h | Alta |
| 14.8 | Actualizar docker-compose.prod.yml con nuevos modelos y migraciones | 2h | Alta |
| 14.9 | Deploy Release 2 a produccion | 3h | Alta |
| 14.10 | Crear usuarios de cliente en produccion | 1h | Alta |
| 14.11 | Verificacion post-deploy: ambos tenants funcionales | 2h | Alta |
| 14.12 | Documentacion de uso para clientes (guia basica) | 2h | Media |

### Criterios de Aceptacion
- [ ] Los 3 flujos E2E pasan sin errores
- [ ] Aislamiento multi-tenant verificado (cliente A no ve cliente B)
- [ ] Cliente real aprueba el portal en sesion UAT
- [ ] Feedback critico corregido
- [ ] Ambos tenants (admin + cliente) funcionan en produccion simultaneamente
- [ ] Usuarios de cliente creados y funcionales
- [ ] Documentacion de uso entregada al cliente

### Riesgos
- Feedback de cliente puede requerir cambios significativos en UX
- Deploy puede requerir migraciones de datos existentes
- Seguridad multi-tenant debe ser exhaustivamente verificada

---

## Buffer y Contingencia

### Release 1

| Concepto | Fecha |
|----------|-------|
| Entrega Sprint 9 | 13 Jun 2026 |
| Fecha objetivo R1 | 15 Jun 2026 |
| **Buffer R1** | **2 dias** |

### Release 2

| Concepto | Fecha |
|----------|-------|
| Entrega Sprint 14 | 22 Ago 2026 |
| **Buffer R2** | **0 dias** |

> **Nota:** Si se necesita mas buffer para Release 2, se puede recortar el Sprint 14 limitando el scope de UAT al feedback critico solamente.

---

## Metricas de Seguimiento por Sprint

| Metrica | Herramienta |
|---------|-------------|
| Velocity (story points completados) | Jira/Board |
| Tests pasando | pytest + npm run typecheck |
| Cobertura de tests | pytest-cov |
| Bugs abiertos vs cerrados | Jira |
| Endpoints implementados vs planificados | Checklist |
| Componentes implementados vs planificados | Checklist |
| Satisfaccion del cliente (post R2) | Encuesta NPS |

---

## Dependencias Criticas (Externas)

### Release 1

| Dependencia | Sprint requerido | Responsable |
|-------------|-----------------|-------------|
| API Key de Clockify (workspace de produccion) | Sprint 3 | Admin Clockify |
| API Token de Jira (proyecto configurado) | Sprint 3 | Admin Jira |
| Servidor/VPS de produccion | Sprint 9 | DevOps/Infra |
| Dominio/subdominio para el dashboard | Sprint 9 | DevOps/Infra |
| Sesion de UAT con stakeholders | Sprint 9 | Product Owner |

### Release 2

| Dependencia | Sprint requerido | Responsable |
|-------------|-----------------|-------------|
| Definicion de branding por cliente (logo, colores) | Sprint 12 | Diseno/PO |
| Cliente real disponible para UAT | Sprint 14 | Product Owner |
| Configuracion SMTP para emails (si se activa) | Sprint 13 | DevOps |
| Subdominio del portal cliente (ej. client.appix.com) | Sprint 14 | DevOps |

---

## Vista de Gantt Simplificada

```
Feb 2026           Mar 2026           Abr 2026           May 2026           Jun 2026           Jul 2026           Ago 2026
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
[==Sprint 1==]
     Infraestructura
              [==Sprint 2==]
              Modelos & Logica
                        [==Sprint 3==]
                        Integraciones
                                  [==Sprint 4==]
                                  API REST
                                            [==Sprint 5==]
                                            Frontend Datos
                                                      [==Sprint 6==]
                                                      Componentes
                                                                [==Sprint 7==]
                                                                Paginas+Reportes
                                                                          [==Sprint 8==]
                                                                          QA & Pulido
                                                                                    [==Sprint 9==]
                                                                                    Deploy R1
                                                                                         |> 15 Jun (R1)
                                                                                              [==Sprint 10==]
                                                                                              Multi-Tenant Auth
                                                                                                        [==Sprint 11==]
                                                                                                        Change Requests
                                                                                                                  [==Sprint 12==]
                                                                                                                  Portal Cliente 1
                                                                                                                            [==Sprint 13==]
                                                                                                                            Portal Cliente 2
                                                                                                                                      [==Sprint 14==]
                                                                                                                                      Deploy R2
                                                                                                                                           |> 22 Ago (R2)
```

---

## Resumen de Entregables por Sprint

### Release 1: Dashboard Administrativo

| Sprint | Entregable Principal | Demo |
|--------|---------------------|------|
| 1 | Docker Compose funcional con 6 servicios | `docker-compose up` exitoso |
| 2 | Modelos + TripleAxisService + 10 tests | Admin con semaforos |
| 3 | Sync automatico Clockify/Jira + Celery | TimeEntries sincronizadas |
| 4 | API REST completa (8 endpoints) | Postman/curl contra API |
| 5 | Capa de datos frontend (tipos + hooks) | `npm run typecheck` limpio |
| 6 | Todos los componentes visuales | Storybook o pagina de demo |
| 7 | 5 paginas + PDF/Excel exports | Navegacion completa en browser |
| 8 | Sistema integrado sin bugs | Flujo E2E completo |
| 9 | **Release 1 en produccion** | Dashboard admin accesible |

### Release 2: Portal de Cliente

| Sprint | Entregable Principal | Demo |
|--------|---------------------|------|
| 10 | Multi-tenant auth + modelos de cliente | Login como cliente, datos aislados |
| 11 | Gestion de cambios de alcance completa | Flujo CR: draft -> approved -> budget |
| 12 | Portal cliente: fases + cobranza | Cliente ve progreso y pagos |
| 13 | Portal cliente: requerimientos + notificaciones | Cliente gestiona pendientes, recibe alertas |
| 14 | **Release 2 en produccion** | Portal cliente accesible |

---

## Metricas de Impacto (Post-Lanzamiento)

Alineadas con la vision del proyecto:

| Metrica | Objetivo | Medicion |
|---------|----------|----------|
| Satisfaccion del cliente | >= 80% | Encuesta NPS post-R2 |
| Proyectos con margen protegido | 100% | Triple Axis: 0 proyectos CRITICAL sin alerta |
| Tiempo de deteccion de desviacion | < 1 hora | Celery Beat sync hourly |
| Adopcion del portal cliente | >= 70% clientes activos | Logins unicos / mes |
| Change Requests gestionados en plataforma | >= 90% | CRs en sistema vs fuera |
