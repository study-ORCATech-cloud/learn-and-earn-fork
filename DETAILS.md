# DETAILS.md

🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-rich codebase intelligence



---

## 1. Project Overview

### Purpose & Domain
**LabDojo Learning Platform** is a modular, scalable React-based Learning Platform designed to provide interactive educational content such as courses, learning paths, projects, labs, and roadmaps. It solves the problem of delivering structured, progressive learning experiences with integrated user progress tracking, role-based access control, premium content monetization through Dojo Coins, and comprehensive management capabilities. The platform provides a unified viewing and completion experience across all content types with responsive design, secure payment processing, and comprehensive mobile support.

### Target Users & Use Cases
- **Learners:** Access courses, labs, projects, purchase Dojo Coins for premium content, and track progress.
- **Educators/Content Managers:** Manage learning content, user progress, premium content access, and roadmap planning.
- **Administrators/Moderators:** Oversee user roles, permissions, Dojo Coins transactions, system health, and operational tasks.
- **Developers:** Extend platform features, integrate new content, maintain payment systems, and system health.

### Core Business Logic & Domain Models
- **Learning Content:** Courses, Learning Paths, Projects, Labs, Roadmaps with unified viewing experience.
- **User Progress:** Comprehensive completion tracking across all content types with multiple completion field support.
- **Content Completion:** Smart completion system with backend state synchronization and disabled button states.
- **Project Integration:** Full project support using LabViewerPage infrastructure with specialized API handling.
- **Dojo Coins Economy:** Virtual currency system for premium content access with secure payment processing.
- **Payment Integration:** Paddle.com integration for secure transactions, package management, and checkout flows.
- **Wallet Management:** User coin balance tracking, transaction history, and purchase management.
- **Package System:** Flexible pricing with one-time purchases, monthly subscriptions, and annual plans.
- **Role & Permission Management:** Fine-grained access control with hierarchical roles.
- **System Management:** Health monitoring, cache management, global logout.
- **Authentication:** Cookie-based authentication with backend integration.
- **Search & Filtering:** Content discovery with advanced filtering and search capabilities.
- **Mobile Responsiveness:** Optimized mobile experience with responsive design patterns.

---

## 2. Architecture and Structure

### High-Level Architecture
- **Frontend:** React SPA using TypeScript, React Router, React Context API, and React Query.
- **State Management:** Context providers for auth, backend data, user progress, search, Dojo Wallet, and management.
- **UI Layer:** Component-based architecture with reusable UI primitives and domain-specific components with mobile-first responsive design.
- **Backend Integration:** REST API services abstracted via service classes with specialized project content handling, payment processing, and query parameter support.
- **Content System:** Unified content viewing through LabViewerPage supporting labs, articles, and projects with consistent completion tracking.
- **Payment System:** Paddle.com integration with secure checkout flows, transaction management, and wallet services.
- **Authentication:** Cookie-based authentication with backend integration and secure session management.
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
│   │   │   └── UserProfile.tsx (mobile-responsive user menu dropdown)
│   │   ├── course/
│   │   │   └── ResourceCard.tsx (enhanced with completion badge support)
│   │   ├── home/
│   │   ├── layout/
│   │   │   └── Logo.tsx (responsive mobile header)
│   │   ├── learning-path/
│   │   ├── management/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── roles/
│   │   │   │   ├── system/
│   │   │   │   └── users/ (mobile-responsive modals: GrantCoinsDialog, ChangeRoleDialog)
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   │   └── ManagementLayout.tsx (fixed contact messages header mapping)
│   │   │   ├── pages/
│   │   │   │   └── ContactMessagesPage.tsx (mobile-responsive modals, fixed duplicate headers)
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── ui/
│   │   │   └── ProjectCard.tsx (redesigned with completion support)
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
│   │   ├── LabViewerPage.tsx (enhanced with project support and completion logic)
│   │   └── LabIDEPage.tsx (improved completion messages and backend state checking)
│   ├── services/
│   │   └── apiService.ts (enhanced with query parameter support for projects)
│   ├── types/
│   │   └── project.ts (added completion fields)
│   ├── App.css
│   ├── App.tsx (added project routes)
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
- **`src/components/`**: Contains UI components organized by domain (auth, course, learning-path, management, ui primitives) with enhanced mobile responsiveness and completion support.
- **`src/context/`**: React Context providers managing global state (auth, backend data, search, user progress).
- **`src/hooks/`**: Custom React hooks encapsulating reusable logic (mobile detection, toast notifications, filtering).
- **`src/management/`**: Management module with mobile-responsive components, modals, and user interfaces.
- **`src/pages/`**: Route/page components including unified content viewing (LabViewerPage) supporting all content types with intelligent completion tracking.
- **`src/services/`**: Service classes abstracting API calls with specialized project content handling and query parameter support.
- **`src/types/`**: TypeScript interfaces and domain models with comprehensive completion field definitions.
- **`src/utils/`**: Utility functions for formatting, validation, permissions, and accessibility.

### Key Interfaces & Implementations
- **Auth Context (`src/context/AuthContext.tsx`)**: Manages authentication state, login/logout flows, token refresh.
- **Backend Data Context (`src/context/BackendDataContext.tsx`)**: Fetches and caches core app data.
- **Management Contexts (`src/management/context/`)**: Separate contexts for management, system health, and user management with reducers and async actions.
- **UI Components (`src/components/ui/`)**: Rich set of reusable UI primitives built on Radix UI, with consistent styling via Tailwind CSS, mobile-first responsive design, and completion badge support.
- **Content Components**: 
  - **ProjectCard (`src/components/ui/ProjectCard.tsx`)**: Redesigned with ResourceCard pattern, completion badges, and project navigation.
  - **ResourceCard (`src/components/course/ResourceCard.tsx`)**: Enhanced with multiple completion field support.
  - **LabViewerPage (`src/pages/LabViewerPage.tsx`)**: Unified content viewer supporting labs, articles, and projects with intelligent completion state management.
  - **LabIDEPage (`src/pages/LabIDEPage.tsx`)**: Enhanced with proper completion message handling and backend state synchronization.
- **Mobile-Responsive Components**:
  - **UserProfile (`src/components/auth/UserProfile.tsx`)**: Fixed user menu dropdown with mobile scrolling support.
  - **ManagementLayout (`src/management/layouts/ManagementLayout.tsx`)**: Fixed contact messages header mapping and breadcrumb support.
  - **ContactMessagesPage (`src/management/pages/ContactMessagesPage.tsx`)**: Enhanced with mobile-responsive modals and fixed duplicate headers.
- **API Service (`src/services/apiService.ts`)**: Enhanced with query parameter support for project-specific content requests.
- **Service Layer (`src/management/services/`)**: Classes like `roleManagementService`, `systemManagementService`, `userManagementService` encapsulate API calls and domain logic.
- **Validation (`src/management/utils/validators.ts`)**: Pure functions for form and input validation.
- **Routing & Navigation (`src/components/layout/`, `src/management/layouts/`)**: Components like responsive `Header.tsx`, `ManagementSidebar.tsx` implement navigation with RBAC and mobile optimization.

### Communication Patterns
- **React Context + Hooks:** For state sharing and logic encapsulation.
- **Service Classes:** Abstract API calls with specialized project handling and query parameter support, returning typed promises.
- **React Router:** Client-side routing with protected routes, role-based guards, and project-specific routes.
- **React Query:** Data fetching and caching in backend data context.
- **Event Handling:** UI components handle user interactions, modals, dialogs, and forms with mobile-responsive behavior.
- **Completion System:** Backend state synchronization with smart Complete button management and toast notifications.

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
- Courses, learning paths, projects, labs, and roadmaps are modeled with TypeScript interfaces including comprehensive completion field support.
- Content is fetched via backend APIs with specialized project handling using query parameters and cached in context.
- Unified content viewing through LabViewerPage supporting all content types with consistent completion tracking.
- Projects integrated with same infrastructure as labs and articles for seamless user experience.
- Smart completion system with backend state synchronization prevents duplicate completion attempts.
- Filtering and search implemented with custom hooks (`useCourseFilters`, `useSearch`).

### Operational Monitoring
- System health, cache stats, and alerts displayed in management UI.
- Global logout and cache clearing supported.
- Error logging centralized via `errorLoggingService`.

### SEO & Accessibility
- SEO managed via React Helmet and static files (`robots.txt`, `sitemap.xml`).
- Accessibility utilities in `src/management/utils/accessibility.ts`.
- UI components built on accessible Radix primitives with mobile-first responsive design.
- Mobile optimization includes responsive headers, scrollable modals, and touch-friendly interfaces.

---

# Summary

The **learn-and-earn-fork** codebase is a modern, modular React TypeScript application designed for scalable educational content delivery and management. It employs best practices in component-based UI design, state management via React Context and hooks, and robust service abstractions for backend integration. The project emphasizes security with OAuth SSO and RBAC, operational reliability with monitoring and error logging, mobile-first responsive design, and comprehensive completion tracking across all content types.

## Recent Enhancements

**Project Integration & Completion System**: The platform now provides unified project support through LabViewerPage with intelligent completion tracking, smart Complete button management, and consistent UI patterns across all content types (labs, articles, projects).

**Mobile Responsiveness**: Comprehensive mobile optimization including responsive headers, scrollable management modals, touch-friendly interfaces, and adaptive layouts ensuring optimal user experience across all device sizes.

**Enhanced API Integration**: Specialized backend communication with query parameter support for project content requests, multiple completion field handling, and robust error management with retry mechanisms.

## Major Platform Updates (2025)

**Complete Orca to Dojo Rebrand**: Comprehensive rebranding throughout the entire platform:
- Updated all UI text from "Orca Coins" to "Dojo Coins"
- Renamed files: `GetOrcaCoinsPage.tsx` → `GetDojoCoinsPage.tsx`, `OrcaWalletContext.tsx` → `DojoWalletContext.tsx`, etc.
- Updated variable names, type definitions, and function names
- Changed GitHub organization references from "study-ORCATech-cloud" to "study-LabDojo-cloud"
- Updated social media links and external references
- Maintained full functionality while updating brand identity

**Paddle Payment Integration**: Implemented secure payment processing system:
- Integrated Paddle.com for payment processing replacing manual PayPal workflow
- Added `CheckoutPage.tsx` with complete Paddle SDK integration
- Implemented purchase initiation API (`/api/v1/purchase/initiate`)
- Added transaction management and automatic redirects to success/cancel pages
- Enhanced error handling and payment event management
- Added browser back button protection to prevent modal persistence

**API Modernization**: Updated backend integration to modern API structure:
- Migrated from `/api/orca/*` to `/api/wallet/*` endpoints
- Updated response field mappings: `orca_balance` → `coin_balance`, `total_orca_earned` → `total_coins_earned`, etc.
- Implemented new request/response format with `package_name` instead of `package_id`
- Enhanced error handling and authentication with cookie-based sessions
- Added comprehensive type safety for all API responses

**Enhanced User Experience**: Improved purchase and payment flows:
- Added collapsible FAQ section with interactive UI components
- Implemented loading states for all purchase actions
- Enhanced package organization by type (one-time, monthly_subscription, yearly_subscription)
- Added dynamic package fetching from backend with proper error handling
- Improved mobile responsiveness across all payment-related pages

**Technical Infrastructure Improvements**:
- Added `DojoWalletContext` for comprehensive wallet state management
- Implemented `dojoCoinsService` for all payment-related API calls
- Enhanced type definitions in `dojoCoins.ts` with proper field mappings
- Added `paddleService` for secure payment processing
- Improved error logging and monitoring for payment flows

This DETAILS.md provides a comprehensive guide for AI agents and developers to understand the project's purpose, architecture, technical structure, dependencies, development patterns, and operational insights, enabling efficient navigation, extension, and maintenance of the codebase.
