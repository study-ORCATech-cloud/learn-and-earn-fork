# DETAILS.md

---


🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-aware codebase analysis

## Project Overview

### Purpose & Domain

This project is a **React + TypeScript Single Page Application (SPA)** designed as an **educational platform** focused on **learning paths, courses, and projects** in software development and IT domains. It provides curated learning journeys, detailed course content, and practical projects to help users acquire skills progressively.

### Problem Solved

- Enables learners to explore structured learning paths composed of multiple courses.
- Provides rich metadata, filtering, and search capabilities for courses and projects.
- Offers interactive UI components for course details, resource management, and progress tracking.
- Supports user progress persistence and personalized experiences.
- Facilitates discovery of projects and exercises categorized by technology and difficulty.

### Target Users & Use Cases

- **Learners** seeking guided educational content in software development, DevOps, cloud, and related fields.
- **Educators and content creators** who want to organize and present learning materials.
- **Developers and engineers** looking for practical projects to apply skills.
- Use cases include browsing learning paths, filtering courses by difficulty or topic, tracking progress, and accessing project resources.

### Core Business Logic & Domain Models

- **LearningPath**: Represents a curated sequence of courses with metadata like estimated hours, tags, and categories.
- **Course**: Individual educational units with descriptions, difficulty, resources, and prerequisites.
- **Project**: Practical exercises with objectives, deliverables, and categorized by technology and difficulty.
- **Resource**: Supplementary materials linked to courses or projects.
- **UserProgress**: Tracks user completion status, favorites, and progress persistence.

---

## Architecture and Structure

### High-Level Architecture

- **Frontend SPA** built with React and TypeScript.
- **Component-Based Architecture**: Modular UI components organized by domain (courses, learning paths, projects, layout, UI primitives).
- **Static Data Layer**: Course, project, and learning path data are stored as static TypeScript modules.
- **State Management**: React Context API for global state (search, user progress).
- **Routing**: React Router for client-side navigation.
- **Styling**: Tailwind CSS with custom theming and utility-first approach.
- **UI Primitives**: Radix UI primitives wrapped with custom styling and composition.
- **Build & Tooling**: Vite as build tool with React SWC plugin, ESLint for linting, and GitHub Actions for CI/CD.

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

### Module Organization & Boundaries

- **`src/components/`**:  
  - **`course/`**: UI components related to courses (filter bar, hero, prerequisites, resource cards).  
  - **`learning-path/`**: Components for learning path UI (hero, sidebar, course groups).  
  - **`layout/`**: Header, navigation, logo, mobile menu, and search bar components.  
  - **`ui/`**: Generic UI primitives and components (buttons, cards, dialogs, accordions, tooltips, forms, etc.) wrapping Radix UI primitives with custom styling and composition.

- **`src/context/`**:  
  - React Context providers for global state: search functionality and user progress tracking.

- **`src/data/`**:  
  - Static data modules for courses, projects, and learning paths, organized by domain and category.

- **`src/hooks/`**:  
  - Custom React hooks encapsulating reusable logic: viewport detection, toast notifications, filtering logic, scroll behavior.

- **`src/pages/`**:  
  - Route-level React components representing pages (home, courses, projects, learning paths, about, contact, 404).

- **`src/types/`**:  
  - TypeScript interfaces defining domain models (`Course`, `LearningPath`, `Project`, `Resource`).

- **`src/lib/utils.ts`**:  
  - Utility functions such as `cn` for className concatenation.

### Key Interfaces & Data Models

- **`LearningPath`**:  
  - Fields: `id`, `title`, `description`, `icon`, `gradient`, `category`, `estimatedHours`, `courseIds`, `courseGroups`, `tags`, `isPopular`, `isNew`, `lastUpdated`.

- **`Course`**:  
  - Fields: `id`, `title`, `description`, `longDescription`, `level`, `difficulty`, `duration`, `icon`, `iconColor`, `color`, `gradient`, `category`, `resources`, `resourceGroups`, `prerequisites`, `tags`, `isPopular`, `isNew`, `estimatedHours`, `lastUpdated`.

- **`Project`**:  
  - Fields: `id`, `title`, `description`, `longDescription`, `difficulty`, `estimatedHours`, `category`, `tags`, `prerequisites`, `objectives`, `deliverables`, `resources`, `isPopular`, `isNew`, `lastUpdated`.

- **`Resource`**:  
  - Fields: `id`, `title`, `description`, `type`, `url`, `tags`, `difficulty`, `duration`, `estimatedMinutes`, `isExternal`, `isInteractive`.

### Communication Patterns

- **Component Composition**: UI components are composed hierarchically (e.g., `LearningPathPage` composes `LearningPathHero`, `CourseGroupSection`, `LearningPathSidebar`).
- **Context API**: Global state shared via React Context (`SearchContext`, `UserProgressContext`).
- **Routing**: React Router manages navigation and URL parameters.
- **Hooks**: Custom hooks encapsulate reusable logic and state management.
- **Static Data Imports**: Data modules are imported directly into components/pages for rendering.

---

## Development Patterns and Standards

### Code Organization Principles

- **Feature-based modularization**: Components and data are grouped by domain (courses, projects, learning paths).
- **Separation of concerns**: UI components separated from data and business logic.
- **TypeScript usage**: Strong typing enforced via interfaces and types.
- **Reusable UI primitives**: Radix UI primitives wrapped and styled consistently.
- **ForwardRef pattern**: Used extensively in UI components for accessibility and composability.

### Testing Strategies & Coverage

- No explicit test files were provided; testing strategy is not visible.
- Given the architecture, unit and integration tests would likely focus on:
  - Component rendering and interaction.
  - Hook logic (e.g., filtering, toast management).
  - Context providers and state management.
- Testing tools are not explicitly listed but could be integrated (e.g., Jest, React Testing Library).

### Error Handling & Logging

- Error handling is minimal in UI components; 404 pages handle routing errors.
- Logging occurs in `NotFound.tsx` for unmatched routes.
- No centralized error boundary components visible.
- Toast notifications provide user feedback for events.

### Configuration Management Patterns

- Environment variables managed via Vite (`vite-env.d.ts`).
- Configuration files for TypeScript, Tailwind CSS, PostCSS, ESLint, and Vite.
- Use of aliases (`@` → `src`) for cleaner imports.
- Static data modules enable configuration via code rather than external APIs.

---

## Integration and Dependencies

### External Libraries & Their Purposes

- **React & React DOM**: Core UI framework.
- **React Router DOM**: Client-side routing.
- **Radix UI**: Accessible UI primitives (accordion, dialog, tooltip, select, etc.).
- **Lucide React**: Iconography.
- **Tailwind CSS**: Utility-first CSS framework with custom theming.
- **React Query (@tanstack/react-query)**: Data fetching and caching (though data is mostly static).
- **Sonner**: Toast notifications.
- **Fuse.js**: Fuzzy search implementation.
- **Recharts**: Charting library.
- **Embla Carousel**: Carousel/slider UI.
- **Class Variance Authority (cva)**: Styling variants management.
- **clsx & tailwind-merge**: Class name composition and merging.
- **Vite**: Build tool with React SWC plugin.
- **GitHub Actions**: CI/CD pipeline for deployment.

### Database or Storage Layer

- No backend or database layer visible; data is static and stored in TypeScript modules.
- User progress is persisted in `localStorage` via `UserProgressContext`.

### API Dependencies & Integrations

- No external API calls visible; data is static.
- Search is performed client-side using Fuse.js over static data.
- Deployment configured for GitHub Pages.

### Build and Deployment Dependencies

- **Vite**: Build and dev server.
- **ESLint**: Linting and code quality.
- **GitHub Actions**: Automated build and deployment to GitHub Pages.
- **PostCSS & Tailwind**: CSS processing.
- **TypeScript**: Static typing and compilation.

---

## Usage and Operational Guidance

### Running Locally

- Use `npm run dev` to start the development server on port 8080.
- The app runs as a SPA with client-side routing.
- Static data is loaded from `src/data/`.
- Use React DevTools and browser console for debugging.

### Building and Deployment

- Run `npm run build` to create a production build in `dist/`.
- GitHub Actions workflow (`.github/workflows/deploy.yml`) automates deployment to GitHub Pages on push to `main`.
- Environment variables (e.g., `VITE_API_URL`) can be configured in `.env` files.

### Extending the Codebase

- **Adding Courses or Projects**: Add new entries in `src/data/courses/` or `src/data/projects/` following existing data models.
- **Adding UI Components**: Place reusable components in `src/components/ui/` or domain-specific components in respective folders.
- **State Management**: Use or extend React Context providers in `src/context/`.
- **Routing**: Add new pages under `src/pages/` and update routes in `src/App.tsx`.
- **Styling**: Use Tailwind CSS classes and extend theme in `tailwind.config.ts`.

### Monitoring and Observability

- No explicit monitoring or analytics integrated.
- Use browser devtools and React Profiler for performance analysis.
- Logging is minimal; consider adding error boundaries and logging services for production.

### Security Considerations

- No backend or API calls; security concerns are minimal.
- User data stored locally; ensure localStorage usage is secure.
- Sanitize any user input if extended to accept external data.

### Performance Characteristics

- Static data enables fast load times.
- Client-side filtering and search use Fuse.js with memoization for efficiency.
- React Query is set up but not heavily used due to static data.

### Scalability Considerations

- Modular data and component architecture supports scaling content and features.
- Static data approach may require migration to backend or API for large datasets.
- UI component library and design system facilitate consistent UI scaling.

---

# Summary

This React + TypeScript project is a **modular, component-driven educational platform SPA** with a strong emphasis on **static data-driven content**, **reusable UI components**, and **client-side state management**. Its architecture supports easy extension of courses, projects, and learning paths, with a scalable design system and modern frontend tooling. The repository structure, coding patterns, and configuration files enable efficient development, testing, and deployment workflows, making it suitable for both developers and AI agents to understand, maintain, and evolve.

---

# Appendix: Quick Navigation

| Area                      | Key Files / Directories                          | Description                                  |
|---------------------------|-------------------------------------------------|----------------------------------------------|
| Entry Point               | `src/main.tsx`, `src/App.tsx`                    | App bootstrap and root component             |
| Routing & Pages           | `src/pages/`                                     | Route-specific page components                |
| UI Components             | `src/components/ui/`                             | Reusable UI primitives and components        |
| Domain Components         | `src/components/course/`, `learning-path/`, `layout/` | Feature-specific UI components                |
| Data                     | `src/data/courses/`, `src/data/projects/`, `src/data/learningPaths.ts` | Static data modules                           |
| State Management          | `src/context/SearchContext.tsx`, `UserProgressContext.tsx` | Global state providers                        |
| Hooks                    | `src/hooks/`                                     | Custom React hooks                            |
| Styling & Theming         | `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `src/App.css` | Styling and theming configuration             |
| Build & Tooling           | `vite.config.ts`, `package.json`, `eslint.config.js` | Build and linting configuration               |
| CI/CD                    | `.github/workflows/deploy.yml`                   | Deployment automation                         |
| Documentation            | `docs/`                                          | Developer and deployment guides               |

---

*End of DETAILS.md*