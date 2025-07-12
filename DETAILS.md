# DETAILS.md

🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-aware codebase analysis



---

## 1. Project Overview

### Purpose & Domain
This project is a **React-based Single Page Application (SPA)** built with **TypeScript** and **Tailwind CSS**, designed as an **educational platform** focused on **learning paths, courses, and projects** in software development and DevOps domains.

- **Problem Solved:**  
  Provides curated learning content, including courses, projects, and resources, enabling users to follow structured learning paths and track progress.
  
- **Target Users:**  
  - Software developers and engineers seeking structured learning in areas like CI/CD, Kubernetes, Python, Docker, cloud technologies, and web development.  
  - Educators or training providers who want to present curated educational content interactively.  
  - Learners who benefit from project-based and resource-rich educational experiences.

- **Use Cases:**  
  - Browsing and filtering courses by difficulty, category, and tags.  
  - Viewing detailed course and project information with prerequisites and resources.  
  - Navigating learning paths composed of grouped courses.  
  - Tracking user progress and favorites.  
  - Searching across learning paths, courses, and projects.  
  - Responsive UI supporting desktop and mobile devices.

- **Core Business Logic & Domain Models:**  
  - **Learning Paths:** Curated sequences of courses grouped by topics.  
  - **Courses:** Individual educational units with metadata, resources, and prerequisites.  
  - **Projects:** Hands-on exercises with objectives, deliverables, and resources.  
  - **Resources:** Supplementary materials (videos, labs, articles).  
  - **User Progress:** Tracking completion and favorites.  
  - **Search:** Cross-domain search across learning paths, courses, and projects.

---

## 2. Architecture and Structure

### High-Level Architecture

- **Frontend SPA:** React + TypeScript application using React Router for client-side routing.
- **Component-Based UI:** Modular React components organized by feature and UI primitives.
- **State Management:** React Context API for global state (search, user progress), local state via hooks.
- **Styling:** Tailwind CSS with utility-first approach, enhanced by `class-variance-authority` for variant styling.
- **Data Layer:** Static data modules providing course, project, and learning path metadata.
- **Build & Tooling:** Vite as build tool, with React SWC plugin for fast compilation.
- **Accessibility:** Uses Radix UI primitives to ensure accessible UI components.
- **Deployment:** Automated GitHub Actions workflow deploying to GitHub Pages.

---

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

## 3. Technical Implementation Details

### Module Organization & Boundaries

- **`src/components/`**:  
  - **Feature folders** (`course/`, `learning-path/`, `layout/`) contain domain-specific UI components.  
  - **`ui/` folder** contains generic, reusable UI primitives and widgets (buttons, cards, accordions, dialogs, etc.), wrapping Radix UI primitives and styled with Tailwind CSS and `class-variance-authority`.

- **`src/context/`**:  
  React Context providers for global state management:  
  - `SearchContext.tsx`: Manages search state, filtering, and results.  
  - `UserProgressContext.tsx`: Tracks user progress, favorites, and completion.

- **`src/data/`**:  
  Static data modules organized by domain:  
  - `courses/`: Course metadata grouped by subject.  
  - `projects/`: Project metadata grouped by category.  
  - `learningPaths.ts`: Learning path definitions aggregating courses.

- **`src/hooks/`**:  
  Custom React hooks encapsulating reusable logic:  
  - `useCourseFilters`: Filtering logic for courses/resources.  
  - `useToast`: Toast notification management.  
  - `useScrollToTop`: Scroll behavior on route changes.  
  - `useMobile`: Responsive viewport detection.

- **`src/lib/utils.ts`**:  
  Utility functions, e.g., `cn` for className concatenation using `clsx` and `tailwind-merge`.

- **`src/pages/`**:  
  Route-level React components representing pages:  
  - Home, About, Contact, Courses, Projects, Learning Paths, NotFound, etc.  
  - Use React Router for navigation and dynamic routing.

- **`src/types/`**:  
  TypeScript interfaces defining domain models:  
  - `learningPath.ts`: Interfaces for LearningPath, Course, Resource, etc.  
  - `project.ts`: Interfaces for Project and ProjectResource.

---

### Key Interfaces & Implementations

- **UI Components:**  
  - Use `React.forwardRef` for ref forwarding.  
  - Accept standard HTML attributes plus variant props (via `class-variance-authority`).  
  - Wrap Radix UI primitives for accessibility and behavior.  
  - Use utility `cn()` for conditional styling.

- **Data Models:**  
  - `LearningPath`, `Course`, `Resource`, `Project` interfaces define data contracts.  
  - Static data modules export arrays of these typed objects.

- **Communication Patterns:**  
  - Context API for global state sharing (`SearchContext`, `UserProgressContext`).  
  - Props drilling for passing data and callbacks to components.  
  - Hooks encapsulate reusable logic and side effects.

---

### Entry Points & Main Execution Paths

- **`src/main.tsx`**: React app bootstrap, mounts `<App />` into DOM.
- **`src/App.tsx`**: Application shell, sets up routing, context providers, global UI components (toasts, tooltips).
- **`src/pages/`**: Route components rendered by React Router based on URL.
- **`src/components/layout/Header.tsx`**: Main header with navigation and search, used across pages.
- **`src/context/SearchContext.tsx`**: Provides search functionality app-wide.
- **`src/context/UserProgressContext.tsx`**: Provides user progress tracking.

---

### Configuration & Deployment Structure

- **Build Tool:** Vite configured via `vite.config.ts` with React SWC plugin.
- **Styling:** Tailwind CSS configured in `tailwind.config.ts`, with PostCSS pipeline (`postcss.config.js`).
- **TypeScript:** Configured via `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`.
- **Deployment:** GitHub Actions workflow (`.github/workflows/deploy.yml`) automates build and deployment to GitHub Pages.
- **Static Assets:** Served from `public/` folder, including favicon, 404 page, robots.txt.

---

## 4. Development Patterns and Standards

### Code Organization Principles

- **Feature-based modularization:** Components grouped by domain (`course`, `learning-path`, `layout`).
- **UI primitives library:** `src/components/ui/` contains reusable, styled components wrapping Radix UI primitives.
- **Separation of concerns:** Data, UI, state management, and utilities are cleanly separated.
- **Type safety:** Strong use of TypeScript interfaces and types for props and data models.
- **ForwardRef pattern:** Used extensively for DOM ref forwarding in UI components.
- **Variant styling:** Managed via `class-variance-authority` (`cva`) for consistent theming.

### Testing Strategies & Coverage

- No explicit test files were provided in the analyzed structure.
- Likely testing is done via component/unit tests (not shown), or manual QA.
- Future recommendation: Add unit and integration tests for components and hooks.

### Error Handling & Logging

- UI components handle missing data gracefully (e.g., `LearningPathNotFound`).
- No explicit global error boundary shown; could be added for robustness.
- Toast notifications used for user feedback (success, error).
- Logging not explicitly detailed.

### Configuration Management Patterns

- Environment-specific configs handled via Vite and TypeScript config files.
- Path aliasing (`@/`) used for cleaner imports.
- Static data separated from UI and logic.
- Use of `.env` files implied but not shown.

---

## 5. Integration and Dependencies

### External Libraries & Their Purposes

- **React & React DOM:** Core UI library.
- **React Router DOM:** Client-side routing.
- **Radix UI:** Accessible UI primitives (dialogs, menus, tooltips, etc.).
- **Lucide React:** Iconography.
- **Tailwind CSS:** Utility-first styling framework.
- **class-variance-authority (`cva`):** Variant-based styling.
- **clsx & tailwind-merge:** Class name utilities.
- **@tanstack/react-query:** Data fetching and caching (used in `App.tsx`).
- **Sonner:** Toast notification system.
- **Fuse.js:** Fuzzy search (likely used in search context).
- **Date-fns:** Date formatting utilities.
- **Vite:** Build tool.
- **TypeScript:** Static typing.
- **GitHub Actions:** CI/CD pipeline.

### Internal Modules & Integration Points

- **`@/components/ui/`**: Shared UI primitives used across features.
- **`@/components/course/`**, **`learning-path/`**, **`layout/`**: Feature-specific UI.
- **`@/context/`**: Global state providers.
- **`@/data/`**: Static data sources.
- **`@/hooks/`**: Reusable logic hooks.
- **`@/lib/utils.ts`**: Utility functions.
- **Pages** consume components, contexts, and data to render views.

---

## 6. Usage and Operational Guidance

### Getting Started

1. **Install dependencies:**  
   ```bash
   npm install
   ```
2. **Run development server:**  
   ```bash
   npm run dev
   ```
3. **Build for production:**  
   ```bash
   npm run build
   ```
4. **Preview production build:**  
   ```bash
   npm run preview
   ```
5. **Deploy:**  
   Automated via GitHub Actions on push to `main` branch.

### Navigating the Codebase

- **UI Components:**  
  Start with `src/components/ui/` for reusable components.  
  Feature-specific UI in `src/components/course/`, `learning-path/`, `layout/`.

- **Pages:**  
  Located in `src/pages/`, each corresponds to a route.

- **Data:**  
  Static data in `src/data/` — courses, projects, learning paths.

- **State Management:**  
  Context providers in `src/context/`.

- **Hooks:**  
  Reusable logic in `src/hooks/`.

- **Utilities:**  
  Helper functions in `src/lib/utils.ts`.

### Modifying or Extending

- **Adding new courses/projects:**  
  Add data objects in `src/data/courses/` or `src/data/projects/`, conforming to defined interfaces.

- **Creating new UI components:**  
  Add in `src/components/ui/` or feature folders, following existing patterns (forwardRef, variant styling).

- **Adding new pages/routes:**  
  Create new files in `src/pages/` and add routes in `App.tsx`.

- **Styling:**  
  Use Tailwind CSS classes and `cva` for variants.

- **State & Context:**  
  Extend or create new contexts/hooks in `src/context/` and `src/hooks/`.

### Performance & Scalability

- Uses React Query for efficient data fetching and caching.
- Static data modules reduce runtime data fetching overhead.
- Responsive design with Tailwind CSS and custom hooks (`useMobile`).
- Modular architecture supports scaling features and UI components.

### Security & Monitoring

- No explicit security mechanisms shown; typical SPA security applies (e.g., HTTPS, CORS).
- No monitoring or logging tools integrated; can be added as needed.

### Observability

- Toast notifications provide user feedback.
- React Developer Tools and browser dev tools for debugging.
- Potential to add logging, error boundaries, and analytics.

---

# Summary

This React + TypeScript SPA is a **modular, scalable educational platform** with a rich UI built on Radix UI primitives and Tailwind CSS. It uses static data modules for courses, projects, and learning paths, combined with React Context for global state like search and user progress. The architecture emphasizes **component reusability, accessibility, and maintainability**.

Developers can quickly onboard by exploring the `src/components/` for UI, `src/data/` for content, and `src/pages/` for routing. The build and deployment are streamlined with Vite and GitHub Actions.

This documentation enables AI agents and developers alike to understand the **project purpose, architecture, technical details, dependencies, and operational guidance** for efficient development and maintenance.

---

# END OF DETAILS.md