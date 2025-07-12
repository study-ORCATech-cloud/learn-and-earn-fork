# DETAILS.md

---


🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-aware codebase analysis

# Project Overview

## Purpose & Domain

This project is a **React + TypeScript Single Page Application (SPA)** designed as an **educational learning platform** focused on **technology courses, learning paths, and projects**. It provides curated content for users to learn topics such as DevOps, Cloud, Kubernetes, Python, Web Development, and more.

### Problem Solved

- Centralizes **structured learning content** (courses, learning paths, projects) with rich metadata.
- Enables **interactive exploration** of educational resources with filtering, search, and progress tracking.
- Provides a **modern, accessible, and responsive UI** for learners to navigate complex technical topics.
- Supports **user progress tracking**, favorites, and completion states.
- Facilitates **content discovery** via search and categorization.

### Target Users & Use Cases

- **Learners and developers** seeking structured learning paths and projects in technology domains.
- **Educators and content curators** managing and presenting course and project data.
- Users who want to **track progress**, filter by difficulty or topic, and explore curated resources.
- Use cases include browsing courses, following learning paths, completing projects, and searching educational content.

### Core Business Logic & Domain Models

- **Learning Paths:** Collections of courses grouped by theme or skill progression.
- **Courses:** Individual educational units with metadata such as difficulty, duration, prerequisites, and resources.
- **Projects:** Hands-on exercises with objectives, deliverables, and resource links.
- **Resources:** Supplementary materials linked to courses or projects (videos, labs, articles).
- **User Progress:** Tracks favorites, completion, and progress per resource.
- **Search:** Fuzzy search over courses and learning paths.

---

# Architecture and Structure

## High-Level Architecture

- **Frontend SPA** built with **React (TSX)**, using **React Router** for client-side routing.
- **Component-Based Architecture:** Modular UI components organized by feature and UI primitives.
- **Static Data Layer:** Courses, projects, and learning paths are defined as static TypeScript data modules.
- **Context API:** Global state management for search and user progress.
- **UI Layer:** Uses Radix UI primitives wrapped in custom styled components for accessibility and consistency.
- **Build & Tooling:** Vite as build tool, Tailwind CSS for styling, React Query for data fetching (where applicable).

## Complete Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── deployment-guide.md
│   ├── local-development.md
│   └── troubleshooting.md
├── public/
│   ├── lovable-uploads/
│   │   ├── ORCATech-logo-transparent.png
│   │   └── orcatech-logo.png
│   ├── 404.html
│   ├── CNAME
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
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
│   │   └── ui/
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
│   │       └── ... (42 more UI component files)
│   ├── context/
│   │   ├── SearchContext.tsx
│   │   └── UserProgressContext.tsx
│   ├── data/
│   │   ├── courses/
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
│   │   ├── projects/
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
│   ├── pages/
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

# Technical Implementation Details

## Module Organization & Boundaries

- **`src/components/`**:  
  - **Feature-specific folders** (`course/`, `learning-path/`, `layout/`) contain domain UI components.  
  - **`ui/` folder** contains reusable, generic UI primitives and design system components (buttons, cards, dialogs, accordions, etc.).  
  - Components use **React functional components** with **TypeScript** and **forwardRef** for integration and accessibility.

- **`src/data/`**:  
  - Static data modules defining **courses**, **projects**, and **learning paths** as typed arrays of domain objects.  
  - Data is strongly typed with interfaces from `src/types/`.

- **`src/context/`**:  
  - React Context providers for **search state** and **user progress** management, exposing hooks (`useSearch`, `useUserProgress`) for consumption.

- **`src/hooks/`**:  
  - Custom React hooks encapsulating reusable logic:  
    - `useCourseFilters` for filtering course resources.  
    - `useToast` for toast notification management.  
    - `useScrollToTop` for scroll behavior on route changes.  
    - `useMobile` for responsive viewport detection.

- **`src/pages/`**:  
  - Route-level React components representing pages (Home, Courses, Projects, Learning Paths, About, Contact, NotFound).  
  - Pages compose UI components and manage local state.

- **`src/lib/utils.ts`**:  
  - Utility functions such as `cn` for className concatenation and Tailwind CSS class merging.

- **`src/types/`**:  
  - TypeScript interfaces defining domain models (`LearningPath`, `Course`, `Project`, `Resource`, etc.).

## Key Interfaces & Data Models

- **LearningPath**:  
  - Represents a learning journey with metadata, course groups, tags, and estimated hours.

- **Course**:  
  - Contains detailed course info, difficulty, duration, resources, and prerequisites.

- **Project**:  
  - Defines project exercises with objectives, deliverables, difficulty, and resources.

- **Resource**:  
  - Supplementary materials linked to courses or projects.

- **UserProgress**:  
  - Tracks user favorites, completion, and progress states.

## Communication Patterns

- **Props Drilling & Composition:**  
  - Data flows top-down via props from pages to components.

- **Context API:**  
  - Global state shared via React Context for search and user progress.

- **Hooks:**  
  - Encapsulate reusable logic and side effects.

- **Static Data Imports:**  
  - Data modules imported directly for rendering and filtering.

---

# Development Patterns and Standards

## Code Organization Principles

- **Feature-based folder structure** for components.
- **Separation of UI primitives (`ui/`) and domain components**.
- **TypeScript for type safety and interface contracts**.
- **React functional components with hooks and forwardRef**.
- **Use of Radix UI primitives wrapped in custom components** for accessibility and styling.
- **Utility-first styling with Tailwind CSS**, managed via `cn` and `cva` utilities.

## Testing Strategies & Coverage

- No explicit test files provided; likely manual or external testing.
- TypeScript enforces compile-time correctness.
- Static data modules facilitate predictable UI rendering.

## Error Handling & Logging

- Minimal error handling in UI components; fallback UI components like `LearningPathNotFound` exist.
- Logging in `NotFound.tsx` for 404 errors.
- React error boundaries not explicitly shown.

## Configuration Management

- Environment and build configs separated (`vite.config.ts`, `tsconfig.*.json`).
- Tailwind CSS configured via `tailwind.config.ts`.
- GitHub Actions workflow for CI/CD deployment.

---

# Integration and Dependencies

## External Libraries

- **React & React DOM:** Core UI framework.
- **React Router DOM:** Client-side routing.
- **Radix UI:** Accessible UI primitives (accordion, dialog, tooltip, etc.).
- **lucide-react:** SVG icon library.
- **Tailwind CSS:** Utility-first styling framework.
- **class-variance-authority (`cva`) & `clsx`/`tailwind-merge`:** Styling utilities.
- **React Query:** Data fetching and caching (used in `App.tsx`).
- **Sonner:** Toast notification system.
- **react-hook-form:** Form state management.
- **recharts:** Charting library.
- **embla-carousel-react:** Carousel UI.
- **react-day-picker:** Date picker UI.
- **fuse.js:** Fuzzy search.
- **date-fns:** Date utilities.

## Internal Modules

- **`src/context/`**: Global state management.
- **`src/hooks/`**: Custom hooks.
- **`src/data/`**: Static domain data.
- **`src/components/ui/`**: Shared UI primitives.
- **`src/components/layout/`**: Layout components.
- **`src/components/course/`, `learning-path/`**: Domain-specific UI components.
- **`src/types/`**: Domain interfaces.
- **`src/lib/utils.ts`**: Utility functions.

## Build & Deployment Dependencies

- **Vite:** Build tool configured in `vite.config.ts`.
- **GitHub Actions:** CI/CD pipeline defined in `.github/workflows/deploy.yml`.
- **Node.js & npm:** Package management and scripts.
- **PostCSS:** CSS processing pipeline.

---

# Usage and Operational Guidance

## Running Locally

- Follow instructions in `docs/local-development.md`.
- Typical commands:
  - `npm install` to install dependencies.
  - `npm run dev` to start development server on `http://localhost:8080`.
- Environment variables can be configured as needed.

## Building and Deployment

- Build with `npm run build`.
- Deployment automated via GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages.
- Deployment guide in `docs/deployment-guide.md`.
- Custom domain configured via `public/CNAME`.

## Navigating the Codebase

- **Start at `src/App.tsx`**: Root component setting up routing and context providers.
- **Explore `src/pages/`**: Route components rendering pages.
- **UI Components in `src/components/`**:  
  - `ui/` for primitives.  
  - Feature folders (`course/`, `learning-path/`, `layout/`) for domain-specific UI.
- **Static Data in `src/data/`**: Courses, projects, learning paths.
- **Global State in `src/context/`**: Search and user progress.
- **Hooks in `src/hooks/`**: Reusable logic.
- **Types in `src/types/`**: Domain models and interfaces.

## Modifying or Extending

- **Add new courses or projects** by extending data files in `src/data/courses/` or `src/data/projects/`.
- **Create new UI components** in appropriate `src/components/` folders, leveraging existing UI primitives.
- **Use context and hooks** for shared state or logic.
- **Follow styling conventions** using Tailwind CSS and `cn` utility.
- **Maintain type safety** by defining or extending interfaces in `src/types/`.

## Monitoring and Observability

- No explicit monitoring code; rely on browser devtools and React DevTools.
- Toast notifications (`sonner`) provide user feedback.
- Logging in error pages for 404s.

## Security Considerations

- No backend code; security concerns mainly relate to client-side routing and data integrity.
- Use HTTPS and secure hosting for deployment.
- Sensitive data (e.g., API keys) managed via environment variables (not shown here).

---

# Summary

This React + TypeScript project is a **modular, component-driven educational platform** with a **static data-driven content model**. It leverages modern frontend technologies and best practices, including:

- **Component composition and design system patterns** with Radix UI and Tailwind CSS.
- **Strong typing and interface-driven development** with TypeScript.
- **Separation of concerns** between UI, data, and state management.
- **Automated build and deployment** pipelines.
- **Extensible architecture** supporting new content and UI features.

The comprehensive directory structure, static data modules, and reusable UI components enable efficient development, maintenance, and scaling of the platform.

---

# END OF DETAILS.md