# DETAILS.md

🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Smart agent-compatible documentation



---

## 1. Project Overview

### Purpose & Domain
This project is a **React + TypeScript Single Page Application (SPA)** designed as a **learning platform** focused on **structured learning paths, courses, and projects** primarily in software development and IT domains. It provides curated educational content, including courses, projects, and exercises, organized into learning paths to guide users through skill acquisition.

### Problem Solved
- Enables learners to discover, filter, and engage with curated educational content.
- Provides structured learning journeys (learning paths) with associated courses and projects.
- Supports filtering, searching, and progress tracking to personalize learning experiences.
- Offers a rich UI with accessible, reusable components for a consistent user experience.

### Target Users & Use Cases
- **Learners** seeking guided educational content in programming, DevOps, cloud, Python, web development, and related fields.
- **Educators and content curators** managing and presenting structured learning materials.
- Use cases include browsing courses, filtering by difficulty or tags, tracking progress, and exploring projects/exercises.

### Core Business Logic & Domain Models
- **LearningPath**: Represents a curated sequence of courses grouped by topics.
- **Course**: Individual educational units with metadata, resources, and prerequisites.
- **Project**: Hands-on exercises or projects categorized by technology and difficulty.
- **Resource**: Supplementary materials linked to courses or projects.
- **UserProgress**: Tracks user completion and favorites.
- **SearchFilters**: Supports filtering and searching across learning paths and courses.

---

## 2. Architecture and Structure

### High-Level Architecture
- **Frontend SPA** built with React and TypeScript.
- **Component-Based Architecture** with modular, reusable UI components.
- **Static Data Layer**: Courses, projects, and learning paths are defined as static TypeScript modules.
- **State Management**: React Context API for global states like search and user progress.
- **Routing**: Client-side routing via `react-router-dom`.
- **Styling**: Tailwind CSS with utility-first styling and custom themes.
- **Accessibility**: Uses Radix UI primitives for accessible UI components.
- **Build Tool**: Vite with React SWC plugin for fast builds.

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
- **`src/components/`**: Contains UI components organized by feature (`course`, `layout`, `learning-path`) and generic UI primitives (`ui/`).
- **`src/context/`**: React Context providers for global state management (`SearchContext`, `UserProgressContext`).
- **`src/data/`**: Static data modules defining domain data (`courses`, `projects`, `learningPaths`).
- **`src/hooks/`**: Custom React hooks encapsulating reusable logic (`use-mobile`, `use-toast`, `useCourseFilters`, `useScrollToTop`).
- **`src/lib/`**: Utility functions (`utils.ts`), e.g., className merging.
- **`src/pages/`**: Route-level React components representing pages.
- **`src/types/`**: TypeScript interfaces defining domain models (`learningPath.ts`, `project.ts`).

### Key Interfaces and Implementations
- **Domain Models:**
  - `LearningPath`, `Course`, `Project`, `Resource`, `UserProgress` defined in `src/types/`.
- **UI Components:**
  - Use of **Radix UI primitives** wrapped in styled React components for accessibility and consistent styling.
  - Components use **`React.forwardRef`** for composability.
  - Styling managed via **Tailwind CSS** and **class-variance-authority (cva)** for variants.
- **State & Context:**
  - `SearchContext` manages search queries and results.
  - `UserProgressContext` tracks user completion and favorites.
- **Hooks:**
  - `useCourseFilters` encapsulates filtering logic for courses/resources.
  - `useToast` manages toast notifications.
  - `useScrollToTop` handles scroll reset on route changes.
  - `useIsMobile` detects viewport size for responsive behavior.

### Communication Patterns
- **Props-Driven UI:** Data flows top-down via props.
- **Context API:** For global state sharing (search, progress).
- **Event Handlers:** User interactions handled via callbacks and hooks.
- **Static Data Imports:** Courses, projects, and learning paths imported as static arrays.

---

## 4. Development Patterns and Standards

### Code Organization Principles
- **Feature-based folder structure** for components.
- **Separation of concerns**: UI, data, hooks, and types separated.
- **Reusable UI primitives** in `src/components/ui`.
- **TypeScript strict typing** for props and domain models.
- **Use of React best practices**: functional components, hooks, forwardRef.

### Testing Strategies & Coverage
- No explicit test files provided; likely relies on manual or external testing.
- TypeScript types provide compile-time safety.
- Components designed for composability facilitate unit testing.

### Error Handling & Logging
- Minimal explicit error handling in UI components.
- Contexts and hooks manage state safely.
- No global error boundary shown but can be added.

### Configuration Management
- Environment variables typed via `vite-env.d.ts`.
- Tailwind CSS configured via `tailwind.config.ts`.
- Build and dev scripts in `package.json`.

---

## 5. Integration and Dependencies

### External Libraries & Their Purposes
- **React & React DOM:** Core UI framework.
- **React Router DOM:** Client-side routing.
- **Radix UI Primitives:** Accessible UI building blocks.
- **Lucide React:** Iconography.
- **Tailwind CSS:** Utility-first styling.
- **class-variance-authority:** Variant-based styling.
- **React Query:** Data fetching and caching.
- **Sonner:** Toast notifications.
- **Fuse.js:** Fuzzy search.
- **React Hook Form & Zod:** Form handling and validation.
- **Embla Carousel & Recharts:** Carousel and charting components.

### Database or Storage Layer
- No backend or database code present; data is static.
- User progress likely stored in local storage or context (not shown explicitly).

### API Dependencies & Integrations
- No external API calls evident; data is static.
- Potential for future API integration for dynamic content.

### Build and Deployment Dependencies
- **Vite** as build tool with React SWC plugin.
- **GitHub Actions** workflow for CI/CD deployment to GitHub Pages.
- **Tailwind CSS and PostCSS** for styling.
- **ESLint** for linting.

---

## 6. Usage and Operational Guidance

### Running Locally
- Follow `docs/local-development.md` for setup instructions.
- Use `npm run dev` to start Vite dev server on `localhost:8080`.
- Environment variables configured via `.env` files (not shown).

### Building and Deployment
- Use `npm run build` to create production build.
- Deployment automated via GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages.
- Tailwind CSS base path configured in `tailwind.config.ts` for correct asset paths.

### Performance Characteristics
- Static data enables fast load times.
- React Query used for caching (if dynamic data added).
- Tailwind CSS and Vite optimize CSS and JS bundles.

### Scalability Considerations
- Modular data files allow easy addition of courses/projects.
- UI components designed for reuse and extension.
- Context and hooks support scalable state management.

### Security Patterns
- No backend or authentication shown.
- Frontend sanitizes inputs via controlled components.
- Uses accessible UI components to prevent common UI vulnerabilities.

### Monitoring and Observability
- No explicit monitoring or logging.
- Can be extended with analytics or error tracking.

---

## 7. Actionable Insights for Developers and AI Agents

- **To understand the domain:**  
  Start with `src/types/learningPath.ts` and `src/types/project.ts` for data models.  
  Review `src/data/` for static content structure.

- **To navigate the UI:**  
  Explore `src/components/ui/` for reusable UI primitives.  
  Feature-specific UI in `src/components/course/`, `learning-path/`, and `layout/`.

- **To modify pages:**  
  Check `src/pages/` for route components.  
  Routing is handled by React Router.

- **To add new content:**  
  Add new courses or projects in `src/data/courses/` or `src/data/projects/`.  
  Update `src/data/learningPaths.ts` for learning path changes.

- **To extend state management:**  
  Use or extend contexts in `src/context/`.  
  Hooks in `src/hooks/` provide reusable logic.

- **To style components:**  
  Use Tailwind CSS classes and `cn` utility from `src/lib/utils.ts`.  
  Variant styling via `class-variance-authority`.

- **To debug or enhance:**  
  Use React DevTools and inspect Radix UI components for accessibility.  
  Modify `vite.config.ts` for build or alias changes.

---

# Summary

This React + TypeScript SPA is a **modular, accessible, and scalable learning platform** with a rich static data layer and reusable UI components. It leverages modern frontend technologies and best practices to provide a maintainable and extensible codebase. The architecture cleanly separates concerns between UI, data, and state management, enabling efficient development and easy onboarding for new contributors or AI agents analyzing the codebase.

---

# End of DETAILS.md