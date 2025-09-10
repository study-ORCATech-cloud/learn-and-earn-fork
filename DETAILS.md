# DETAILS.md

🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-rich codebase intelligence



---

## 1. Project Overview

### Purpose & Domain
**labdojo-fork** is a modular, scalable React-based Learning Platform designed to provide interactive educational content such as courses, learning paths, projects, labs, and roadmaps. It solves the problem of delivering structured, progressive learning experiences with integrated user progress tracking, role-based access control, and management capabilities.

### Target Users & Use Cases
- **Learners:** Access courses, labs, projects, and track progress.
- **Educators/Content Managers:** Manage learning content, user progress, and roadmap planning.
- **Administrators/Moderators:** Oversee user roles, permissions, system health, and operational tasks.
- **Developers:** Extend platform features, integrate new content, and maintain system health.

### Core Business Logic & Domain Models
- **Learning Content:** Courses, Learning Paths, Projects, Labs, Roadmaps.
- **User Progress:** Tracking completion, favorites, achievements.
- **Role & Permission Management:** Fine-grained access control with hierarchical roles.
- **System Management:** Health monitoring, cache management, global logout.
- **Authentication:** OAuth-based SSO with Google and GitHub providers.
- **Search & Filtering:** Content discovery with advanced filtering and search capabilities.

---

## 2. Architecture and Structure

### High-Level Architecture
- **Frontend:** React SPA using TypeScript, React Router, React Context API, and React Query.
- **State Management:** Context providers for auth, backend data, user progress, search, and management.
- **UI Layer:** Component-based architecture with reusable UI primitives and domain-specific components.
- **Backend Integration:** REST API services abstracted via service classes.
- **Authentication:** OAuth 2.0 SSO with secure cookie-based token management.
- **Deployment:** CI/CD pipeline deploying to GitHub Pages using Vite build system.

### Complete Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/ (48 items)
│   ├── advanced-topics/
│   ├── architecture-development/
│   ├── content-management/
│   ├── contributor-community/
│   ├── maintenance-operations/
│   ├── technical-operational/
│   ├── user-feature/
│   ├── FRONTEND_SSO_IMPLEMENTATION_PLAN.md
│   ├── MANAGEMENT_IMPLEMENTATION_PLAN.md
│   ├── README.md
│   ├── backend-management-api.md
│   ├── deployment-guide.md
│   ├── fe-sso-plan.md
│   ├── lab-viewer-implementation-plan.md
│   ├── roadmap-plan.md
│   ├── seo-implementation-plan.md
│   └── troubleshooting.md
├── public/
│   ├── assets/
│   ├── 404.html
│   ├── CNAME
│   ├── favicon.ico
│   ├── placeholder.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── course/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── learning-path/
│   │   ├── management/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── roles/
│   │   │   │   ├── system/
│   │   │   │   └── users/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable-panel.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── ui.tsx
│   │   │   └── use-toast.ts
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── management/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .gitignore
├── DETAILS.md
├── README.md
├── bun.lockb
├── components.json
├── env.example
├── eslint.config.js
├── index.html
├── package.json
├── permission-metadata.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 3. Technical Implementation Details

### Module Organization & Boundaries
- **`src/components/`**: Contains UI components organized by domain (auth, course, learning-path, management, ui primitives).
- **`src/context/`**: React Context providers managing global state (auth, backend data, search, user progress).
- **`src/hooks/`**: Custom React hooks encapsulating reusable logic (mobile detection, toast notifications, filtering).
- **`src/management/`**: Management module with subfolders for components, context, hooks, layouts, pages, services, types, and utils.
- **`src/pages/`**: Route/page components for public-facing and management views.
- **`src/services/`**: Service classes abstracting API calls and business logic.
- **`src/types/`**: TypeScript interfaces and domain models.
- **`src/utils/`**: Utility functions for formatting, validation, permissions, and accessibility.

### Key Interfaces & Implementations
- **Auth Context (`src/context/AuthContext.tsx`)**: Manages authentication state, login/logout flows, token refresh.
- **Backend Data Context (`src/context/BackendDataContext.tsx`)**: Fetches and caches core app data.
- **Management Contexts (`src/management/context/`)**: Separate contexts for management, system health, and user management with reducers and async actions.
- **UI Components (`src/components/ui/`)**: Rich set of reusable UI primitives built on Radix UI, with consistent styling via Tailwind CSS and `class-variance-authority`.
- **Service Layer (`src/management/services/`)**: Classes like `roleManagementService`, `systemManagementService`, `userManagementService` encapsulate API calls and domain logic.
- **Validation (`src/management/utils/validators.ts`)**: Pure functions for form and input validation.
- **Routing & Navigation (`src/components/layout/`, `src/management/layouts/`)**: Components like `Header.tsx`, `ManagementSidebar.tsx` implement navigation with RBAC.

### Communication Patterns
- **React Context + Hooks:** For state sharing and logic encapsulation.
- **Service Classes:** Abstract API calls, returning typed promises.
- **React Router:** Client-side routing with protected routes and role-based guards.
- **React Query:** Data fetching and caching in backend data context.
- **Event Handling:** UI components handle user interactions, modals, dialogs, and forms.

---

## 4. Development Patterns and Standards

### Code Organization Principles
- **Feature-based modularization:** Components and logic grouped by domain (e.g., management, auth, courses).
- **Separation of concerns:** UI, state management, services, and types are clearly separated.
- **TypeScript strict typing:** Interfaces and types enforce data contracts.
- **Reusable UI primitives:** Extensive use of atomic UI components with consistent styling.
- **Context + Hooks:** For scalable state management and side effects.

### Testing Strategies & Coverage
- While explicit tests are not shown, the modular design and pure utility functions facilitate unit testing.
- Validation functions and service classes are designed for testability.
- UI components are decoupled and composable, supporting component-level testing.

### Error Handling & Logging
- Centralized error logging via `errorLoggingService.ts`.
- UI components use error boundaries (`ErrorBoundary` in management).
- Validation functions return explicit error messages.
- API services handle retries and auth errors gracefully.

### Configuration Management
- Environment variables (`.env`, `import.meta.env`) configure backend URLs, feature toggles, and build settings.
- Tailwind and PostCSS configs manage styling.
- Vite config supports development and production builds with plugins.

---

## 5. Integration and Dependencies

### External Libraries
- **React ecosystem:** React, React Router DOM, React Query, React Helmet Async.
- **UI libraries:** Radix UI primitives, Lucide React icons, Tailwind CSS, class-variance-authority.
- **Build tools:** Vite, SWC compiler.
- **Authentication:** OAuth 2.0 with Google and GitHub.
- **Testing & Monitoring:** References to axe-core, Lighthouse, Sonner (toast), and error logging.

### Internal Integrations
- **Service Layer:** API services abstract backend communication.
- **Context Providers:** Share global state and business logic.
- **UI Components:** Consume context and services, implement domain-specific UI.
- **Routing:** Role-based protected routes guard management pages.
- **CI/CD:** GitHub Actions workflow automates build and deployment to GitHub Pages.

---

## 6. Usage and Operational Guidance

### Running the Project
- Use `npm install` to install dependencies.
- Run `npm run dev` to start the development server.
- Build with `npm run build`.
- Deploy via GitHub Actions configured in `.github/workflows/deploy.yml`.

### Extending the Codebase
- Add new domain features under `src/components/` or `src/management/components/`.
- Define new types in `src/types/` and `src/management/types/`.
- Add API endpoints and service methods in `src/management/services/`.
- Use existing UI primitives in `src/components/ui/` for consistent styling.
- Manage global state via context providers and hooks.

### Authentication & Authorization
- OAuth SSO implemented with Google and GitHub providers.
- Auth state managed in `AuthContext`.
- Role-based access control enforced in management UI and routes.
- Use `ProtectedRoute` component to guard routes.

### Content Management
- Courses, learning paths, projects, labs, and roadmaps are modeled with TypeScript interfaces.
- Content is fetched via backend APIs and cached in context.
- Filtering and search implemented with custom hooks (`useCourseFilters`, `useSearch`).

### Operational Monitoring
- System health, cache stats, and alerts displayed in management UI.
- Global logout and cache clearing supported.
- Error logging centralized via `errorLoggingService`.

### SEO & Accessibility
- SEO managed via React Helmet and static files (`robots.txt`, `sitemap.xml`).
- Accessibility utilities in `src/management/utils/accessibility.ts`.
- UI components built on accessible Radix primitives.

---

# Summary

The **labdojo-fork** codebase is a modern, modular React TypeScript application designed for scalable educational content delivery and management. It employs best practices in component-based UI design, state management via React Context and hooks, and robust service abstractions for backend integration. The project emphasizes security with OAuth SSO and RBAC, operational reliability with monitoring and error logging, and developer experience with clear modularization and comprehensive documentation.

This DETAILS.md provides a comprehensive guide for AI agents and developers to understand the project’s purpose, architecture, technical structure, dependencies, development patterns, and operational insights, enabling efficient navigation, extension, and maintenance of the codebase.
