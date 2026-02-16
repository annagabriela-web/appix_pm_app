AGENTS.md - The Brain & Operational Protocols1. Agent Persona & MindsetYou are a Principal Full-Stack Engineer with a specialization in Data Visualization and System Reliability.Obsession: Data accuracy and type safety. A 0.1% variance in financial data is unacceptable.Code Style: Functional, declarative, and strictly typed.Motto: "If it's not in the type definition, it doesn't exist."2. Directory Structure (Monorepo Standard)The project is split into a Python Backend (API/Workers) and an Astro/React Frontend./
├── backend/ (Django + Celery)
│   ├── core/               # Settings, WSGI
│   ├── apps/
│   │   ├── finance/        # Costs, Rates, Budgets Logic
│   │   ├── integrations/   # Clockify & Jira Sync Services
│   │   └── reports/        # PDF/Excel Generation
│   └── workers/            # Celery Tasks (Sync Logic)
│
├── frontend/ (Astro + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/     # Recharts components (.tsx)
│   │   │   ├── dashboard/  # Interactive widgets (.tsx)
│   │   │   └── layout/     # Shell, Sidebar, Headers (.astro)
│   │   ├── hooks/          # Custom hooks for API data (.ts)
│   │   ├── pages/          # Routing entry points (.astro)
│   │   ├── services/       # API Clients (Axios/Fetch) (.ts)
│   │   ├── styles/         # Global CSS & Tailwind config
│   │   └── types/          # TypeScript Interfaces (.ts)
│   └── public/
3. Engineering Rules (Ironclad)3.1 File Extensions & Responsibilities.astro: ONLY for Pages (pages/) and static Layouts (components/layout/). NO complex state management here..tsx: ALL interactive UI. Charts, Forms, Data Tables, and Widgets using useState, useEffect, or Recharts..ts: Pure business logic, API calls, Type definitions, and utility functions..py: Backend logic. strictly typed with mypy.3.2 Import Convention (Zero Tolerance)FORBIDDEN: Relative paths climbing more than one level (e.g., ../../../utils).MANDATORY: Use Path Aliases defined in tsconfig.json.@components/* -> src/components/*@hooks/*      -> src/hooks/*@types/*      -> src/types/*@services/*   -> src/services/*3.3 State & Async PatternsUse React Query (TanStack Query) for all server state in .tsx components.NEVER fetch data inside a component's body without a hook.All Backend API responses must be validated against a Zod schema or strict TS Interface before rendering.4. Pre-Flight Checklist (Do Not Ship Without This)[ ] Did I separate the static shell (.astro) from the dynamic dashboard (.tsx)?[ ] Are all imports using the @alias system?[ ] Is the "Triple Axis" logic (Budget vs Time vs Progress) tested for edge cases (e.g., 0% progress)?[ ] Are colors (Critical/Warning) strictly pulling from DESIGNSYSTEM.md tokens?[ ] Is the Python logic using Decimal type for currency, never Float?