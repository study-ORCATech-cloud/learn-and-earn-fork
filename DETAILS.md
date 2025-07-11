# DETAILS.md

---

## Project Overview

### Purpose & Domain
This project is a **React + TypeScript** Single Page Application (SPA) designed as a **learning platform** focused on **technology education**. It provides curated **learning paths**, **courses**, and **projects** across various domains such as web development, Python, Kubernetes, CI/CD, Docker, Infrastructure as Code (IaC), and more.

### Problem Solved
- Enables learners to discover, navigate, and track progress through structured learning paths and courses.
- Provides rich metadata, filtering, and search capabilities to help users find relevant content efficiently.
- Supports project-based learning with detailed project descriptions, objectives, and resources.
- Facilitates user progress tracking, favorites, and personalized learning experiences.

### Target Users & Use Cases
- **Learners and developers** seeking structured educational content in software development and DevOps.
- **Educators and content creators** managing and presenting curated learning paths and projects.
- Users who want **interactive filtering, search, and progress tracking** within a modern web UI.
- Use cases include browsing courses, filtering by difficulty or topic, viewing project details, and tracking learning progress.

### Core Business Logic & Domain Models
- **Learning Paths**: Aggregations of courses grouped by topic or skill area.
- **Courses**: Individual learning units with metadata, resources, and prerequisites.
- **Projects**: Hands-on exercises with objectives, deliverables, and difficulty ratings.
- **Resources**: Supplementary materials linked to courses or projects.
- **User Progress**: Tracks completion, favorites, and learning state per user.
- **Search & Filtering**: Enables dynamic querying across courses and projects.

---

## Architecture and Structure

### High-Level Architecture
- **Frontend SPA** built with **React** and **TypeScript**, using **React Router** for client-side routing.
- **Component-Based Architecture** with separation into:
  - **UI Primitives** (`src/components/ui/`): Reusable, styled, accessible components wrapping Radix UI primitives.
  - **Feature Components** (`src/components/course/`, `src/components/learning-path/`, `src/components/layout/`): Domain-specific UI components.
  - **Pages** (`src/pages/`): Route-level components rendering full pages.
  - **Context Providers** (`src/context/`): Global state management for search and user progress.
  - **Static Data Modules** (`src/data/`): Hardcoded course, project, and learning path data.
  - **Hooks** (`src/hooks/`): Custom React hooks for UI behavior and business logic.
  - **Utilities** (`src/lib/utils.ts`): Helper functions for styling and other common tasks.

### Complete Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── deployment-guide.md
│   ├── local-development.md
│   └── troubleshooting.md
├── public/ (8 items)
│   ├── lovable-uploads/
│   │   ├── ORCATech-logo-transparent.png
│   │   └── orcatech-logo.png
│   ├── 404.html
│   ├── CNAME
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/ (122 items)
│   ├── components/ (70 items)
│   │   ├── course/
│   │   │   ├── CourseFilterBar.tsx
│   │   │   ├── CourseHero.tsx
│   │   │   ├── CoursePrerequisites.tsx
│   │   │   ├── ResourceCard.tsx
│   │   │   └── ResourcesSection.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── learning-path/
│   │   │   ├── CourseGroupSection.tsx
│   │   │   ├── LearningPathHero.tsx
│   │   │   ├── LearningPathNotFound.tsx
│   │   │   └── LearningPathSidebar.tsx
│   │   └── ui/ (52 items)
│   │       ├── CourseCard.tsx
│   │       ├── LearningPathCard.tsx
│   │       ├── ProjectCard.tsx
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       └── ... (42 more files)
│   ├── context/
│   │   ├── SearchContext.tsx
│   │   └── UserProgressContext.tsx
│   ├── data/ (20 items)
│   │   ├── courses/ (11 items)
│   │   │   ├── cicd.ts
│   │   │   ├── cloud.ts
│   │   │   ├── docker.ts
│   │   │   ├── expert.ts
│   │   │   ├── git.ts
│   │   │   ├── iac.ts
│   │   │   ├── index.ts
│   │   │   ├── kubernetes.ts
│   │   │   ├── programming.ts
│   │   │   ├── sysadmin.ts
│   │   │   └── web.ts
│   │   ├── projects/ (6 items)
│   │   │   ├── cicd.ts
│   │   │   ├── docker.ts
│   │   │   ├── iac.ts
│   │   │   ├── index.ts
│   │   │   ├── kubernetes.ts
│   │   │   └── python.ts
│   │   └── learningPaths.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useCourseFilters.ts
│   │   └── useScrollToTop.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/ (11 items)
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── CoursePage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── Index.tsx
│   │   ├── LearningPathPage.tsx
│   │   ├── LearningPathsPage.tsx
│   │   ├── NotFound.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── ProjectsPage.tsx
│   ├── types/
│   │   ├── learningPath.ts
│   │   └── project.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── DETAILS.md
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Technical Implementation Details

### Core Technologies
- **React 18+ with TypeScript:** Strongly typed UI components and hooks.
- **React Router DOM:** Declarative routing with dynamic parameters.
- **Radix UI Primitives:** Accessible, unstyled base components wrapped with custom styling.
- **Tailwind CSS:** Utility-first CSS framework with custom theming and animations.
- **React Query (@tanstack/react-query):** Server state management (though data is mostly static).
- **Sonner:** Toast notification system.
- **Recharts:** Charting library for data visualization.
- **Embla Carousel:** Carousel/slider UI component.
- **Fuse.js:** Fuzzy search engine used in search context.
- **React Hook Form & Zod:** Form management and validation (implied by dependencies).
- **Vite:** Modern build tool with React SWC plugin for fast builds.

### Application Entry Points
- `src/main.tsx`: Bootstraps React app, renders `<App />` into DOM.
- `src/App.tsx`: Root component, sets up context providers (`UserProgressProvider`, `SearchProvider`, `TooltipProvider`), routing (`<Routes>`), and global layout.
- `src/pages/`: Route components rendering full pages (Home, Courses, Projects, Learning Paths, NotFound).
- `src/components/layout/`: Header, navigation, mobile menu, and search bar components for consistent UI layout.

### Data Layer
- Static data files under `src/data/`:
  - `courses/`: Course metadata grouped by domain.
  - `projects/`: Project metadata grouped by domain.
  - `learningPaths.ts`: Aggregated learning path definitions.
- Data is typed with interfaces from `src/types/learningPath.ts` and `src/types/project.ts`.
- Data is imported directly into pages and components for rendering.

### UI Components
- **UI Primitives (`src/components/ui/`):**  
  - Atomic components like `Button`, `Badge`, `Card`, `Input`, `Select`, `Popover`, `Tooltip`, `Toast`, `Tabs`, `Accordion`, `Dialog`, `Checkbox`, `RadioGroup`, `Slider`, `Switch`, `Table`, etc.
  - Built with React + Radix UI + Tailwind CSS + `class-variance-authority` for variant styling.
  - Use `React.forwardRef` extensively for accessibility and integration.
- **Feature Components:**  
  - `CourseCard`, `LearningPathCard`, `ProjectCard`: Present domain-specific data.
  - `CourseFilterBar`, `ResourcesSection`: Filtering and resource display.
  - `LearningPathHero`, `CourseGroupSection`, `LearningPathSidebar`: Learning path UI.
  - `Header`, `Navigation`, `MobileMenu`, `SearchBar`: Layout and navigation.

### State Management & Hooks
- **React Context Providers:**
  - `UserProgressContext`: Tracks user progress, favorites, and persistence.
  - `SearchContext`: Manages search queries, results, and filters.
- **Custom Hooks:**
  - `useCourseFilters`: Encapsulates filtering logic for courses/resources.
  - `useScrollToTop`: Scrolls to top on route changes.
  - `useIsMobile`: Detects mobile viewport.
  - `useToast`: Toast notification management.

### Routing & Navigation
- Uses React Router v6 with `<Routes>` and `<Route>` components.
- Dynamic routes for courses (`/course/:courseId`), learning paths (`/learning-path/:pathId`), and projects.
- Redirect component (`Index.tsx`) redirects to home.
- 404 pages (`NotFound.tsx`, `NotFoundPage.tsx`) handle unmatched routes.

### Styling & Theming
- Tailwind CSS with custom configuration (`tailwind.config.ts`).
- CSS variables and dark mode support in `src/index.css` and `src/App.css`.
- Utility function `cn()` merges class names conditionally.
- `class-variance-authority` (`cva`) manages component variants and styling.

---

## Development Patterns and Standards

### Code Organization
- **Feature-based modularity:** Components grouped by feature/domain (`course`, `learning-path`, `layout`, `ui`).
- **UI primitives separated from business components:** `src/components/ui` contains reusable UI elements; domain components live in feature folders.
- **Static data separated from UI:** `src/data` holds content, decoupled from rendering logic.
- **TypeScript interfaces** in `src/types` enforce data contracts and enable type safety.

### Component Design
- **Functional Components with Hooks:** All React components use functional style and hooks.
- **ForwardRef Pattern:** Used extensively for accessibility and integration.
- **Compound Components:** Many UI components use compound patterns (e.g., Accordion, Dialog, Tabs).
- **Composition over Inheritance:** Components are composed from primitives and smaller parts.
- **Variant-based Styling:** `cva` and `cn` utilities enable flexible, theme-aware styling.

### State Management
- **Context API:** For global state (search, user progress).
- **Local state:** Managed via `useState` in components for UI-specific state (e.g., collapsible sections).
- **Custom hooks:** Encapsulate reusable logic (filtering, responsiveness, scroll behavior).

### Testing & Quality
- **Linting:** ESLint configured via `eslint.config.js`.
- **Type Checking:** Strict TypeScript configuration (`tsconfig.json`).
- **Code Quality:** Use of `class-variance-authority` and utility functions promotes maintainable styling.

### Error Handling & Logging
- Minimal explicit error handling in UI components; relies on React error boundaries or upstream handling.
- Console logs in error pages (`NotFound.tsx`) for debugging.

### Configuration Management
- Environment variables managed via Vite (`vite-env.d.ts`).
- Tailwind and PostCSS configured for styling.
- Build and development scripts defined in `package.json`.

---

## Integration and Dependencies

### External Libraries & Purposes
- **React & React DOM:** Core UI framework.
- **React Router DOM:** Client-side routing.
- **Radix UI:** Accessible UI primitives.
- **Tailwind CSS:** Styling framework.
- **React Query:** Data fetching and caching (potentially for future dynamic data).
- **Lucide React:** SVG icon library.
- **Sonner:** Toast notifications.
- **Recharts:** Charting.
- **Embla Carousel:** Carousel UI.
- **Fuse.js:** Fuzzy search engine.
- **React Hook Form & Zod:** Form handling and validation.
- **Vite:** Build tool with React SWC plugin.
- **Class Variance Authority:** Styling variants management.
- **clsx & tailwind-merge:** Class name utilities.

### Internal Modules
- **`src/components/`**: UI and feature components.
- **`src/context/`**: React Context providers.
- **`src/data/`**: Static content.
- **`src/hooks/`**: Custom hooks.
- **`src/lib/utils.ts`**: Utility functions.

### Build & Deployment
- **Vite config (`vite.config.ts`)**: Build and dev server setup.
- **GitHub Actions (`.github/workflows/deploy.yml`)**: CI/CD pipeline for deployment to GitHub Pages.
- **Static assets (`public/`)**: Favicons, 404 page, robots.txt, images.

---

## Usage and Operational Guidance

### Getting Started
- **Install dependencies:** `npm ci` or `yarn install`.
- **Run development server:** `npm run dev` (starts Vite dev server on port 8080).
- **Build for production:** `npm run build`.
- **Preview production build:** `npm run preview`.
- **Lint code:** `npm run lint`.

### Project Structure Navigation
- **Pages:** `src/pages/` — entry points for routes.
- **UI Components:** `src/components/ui/` — reusable UI primitives.
- **Feature Components:** `src/components/course/`, `src/components/learning-path/`, `src/components/layout/`.
- **Data:** `src/data/` — static course, project, and learning path data.
- **Context:** `src/context/` — global state providers.
- **Hooks:** `src/hooks/` — reusable logic hooks.
- **Utilities:** `src/lib/utils.ts` — helper functions.

### Modifying or Extending Content
- Add or update courses in `src/data/courses/`.
- Add or update projects in `src/data/projects/`.
- Modify learning paths in `src/data/learningPaths.ts`.
- Use TypeScript interfaces in `src/types/` to maintain data consistency.

### Adding UI Components
- Create new components in `src/components/ui/` for reusable UI elements.
- Use Radix UI primitives and `cva` for styling consistency.
- Follow existing patterns of `forwardRef` and variant styling.

### State and Context
- Use existing contexts (`UserProgressContext`, `SearchContext`) for global state.
- Create new contexts in `src/context/` if needed for additional global state.

### Routing
- Add new pages in `src/pages/`.
- Update routing in `src/App.tsx` to add new routes.
- Use React Router's dynamic routing features for parameterized routes.

### Theming and Styling
- Modify Tailwind config (`tailwind.config.ts`) to customize theme colors, fonts, and animations.
- Use `cn()` utility for conditional class names.
- Leverage CSS variables in `src/index.css` and `src/App.css` for theming.

### Deployment
- CI/CD pipeline configured via `.github/workflows/deploy.yml` to deploy to GitHub Pages.
- Static assets served from `public/`.
- Environment variables configured via Vite.

### Monitoring and Observability
- No explicit monitoring integrated; consider adding logging or analytics as needed.
- Use browser devtools and React DevTools for debugging.

---

## Summary

This React + TypeScript project is a **modular, scalable learning platform** with a clean separation of concerns:

- **Static data-driven** content for courses, projects, and learning paths.
- **Reusable UI primitives** built on Radix UI and Tailwind CSS.
- **Context-based global state** for user progress and search.
- **Modern development tooling** with Vite, ESLint, and TypeScript.
- **Comprehensive routing and page structure** for SPA navigation.
- **CI/CD pipeline** for automated deployment.

The codebase is well-structured for maintainability, extensibility, and rapid development, with clear patterns for adding new content, UI components, and features.

---

*This document is optimized for AI agents and developers to quickly understand the project’s purpose, architecture, and how to work with the codebase effectively.*