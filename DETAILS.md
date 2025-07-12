# DETAILS.md

🔍 **Powered by [Detailer](https://detailer.ginylil.com)** - Context-aware codebase analysis



---

## 1. Project Overview

### Purpose & Domain
This project is a **React-based educational platform** focused on delivering curated learning paths, courses, and projects primarily in software development and IT domains (e.g., web development, Python, Kubernetes, CI/CD). It aims to provide:

- **Structured learning journeys** (Learning Paths) composed of multiple courses.
- **Detailed course content** with resources, prerequisites, and metadata.
- **Hands-on projects and exercises** categorized by technology and difficulty.
- **Rich UI components** for interactive, accessible, and responsive user experiences.

### Target Users & Use Cases
- **Learners and developers** seeking guided education in software and IT skills.
- **Educators and content creators** managing course and project content.
- **Administrators** overseeing user progress and content updates.
- Use cases include browsing courses, filtering resources, tracking progress, and engaging with projects.

### Core Business Logic & Domain Models
- **LearningPath:** Aggregates multiple courses into a cohesive curriculum.
- **Course:** Represents individual educational units with metadata, resources, and prerequisites.
- **Project:** Practical exercises with objectives and deliverables.
- **Resource:** Supplementary materials linked to courses or projects.
- **UserProgress:** Tracks user completion, favorites, and preferences.

---

## 2. Architecture and Structure

### High-Level Architecture
- **Frontend SPA:** Built with React and TypeScript, using React Router for navigation.
- **Component-Based UI:** Modular, reusable UI components organized by domain and generic UI primitives.
- **State Management:** React Context API for global state (search, user progress), React Query for server state.
- **Static Data Layer:** Course, project, and learning path data stored as static TypeScript modules.
- **Build & Deployment:** Vite as build tool, Tailwind CSS for styling, GitHub Actions for CI/CD.

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

## 3. Technical Implementation Details

### Module Organization & Boundaries
- **`src/components/`**: Contains React UI components, subdivided by domain:
  - `course/`: Course-related UI components (filter bar, hero, resources).
  - `layout/`: Header, navigation, mobile menu components.
  - `learning-path/`: Components for learning path display and interaction.
  - `ui/`: Generic UI primitives and design system components (buttons, cards, dialogs, accordions, etc.).
- **`src/context/`**: React Context providers for global state:
  - `SearchContext.tsx`: Search state and logic.
  - `UserProgressContext.tsx`: User progress tracking.
- **`src/data/`**: Static data modules:
  - `courses/`: Course data per domain.
  - `projects/`: Project data per domain.
  - `learningPaths.ts`: Learning path data.
- **`src/hooks/`**: Custom React hooks encapsulating reusable logic:
  - `useCourseFilters.ts`: Filtering logic for course resources.
  - `useToast.ts`: Toast notification management.
  - `use-mobile.tsx`: Responsive viewport detection.
  - `useScrollToTop.ts`: Scroll behavior on route change.
- **`src/lib/utils.ts`**: Utility functions (e.g., `cn` for className concatenation).
- **`src/pages/`**: Route-level React components representing pages.
- **`src/types/`**: TypeScript interfaces defining domain models (`LearningPath`, `Course`, `Project`, `Resource`).

### Key Interfaces & Data Models
- **LearningPath**: Aggregates courses, metadata, tags, and UI display info.
- **Course**: Detailed course info including resources, prerequisites, difficulty.
- **Project**: Hands-on exercises with objectives, deliverables, and resources.
- **Resource**: Supplementary materials linked to courses/projects.
- **UserProgress**: Tracks user completion and favorites.

### Communication Patterns
- **React Context API**: For global state sharing (search, user progress).
- **Props Drilling & Callbacks**: Parent components manage state and pass handlers to children (e.g., filtering, collapsible toggles).
- **Static Data Imports**: Components import static data modules for rendering.
- **React Router**: URL parameters and navigation drive dynamic content rendering.

### Entry Points & Execution Paths
- **`src/main.tsx`**: React app bootstrap, renders `<App />`.
- **`src/App.tsx`**: Root component setting up routing, context providers, and global UI.
- **`src/pages/`**: Route components rendered by React Router.
- **UI Components**: Composed within pages and layouts.

### Configuration & Deployment Structure
- **Vite (`vite.config.ts`)**: Build and dev server configuration.
- **Tailwind CSS (`tailwind.config.ts`, `postcss.config.js`)**: Styling and theming.
- **GitHub Actions (`.github/workflows/deploy.yml`)**: CI/CD pipeline for deployment to GitHub Pages.
- **Static Assets (`public/`)**: Favicons, 404 page, robots.txt, images.

---

## 4. Development Patterns and Standards

### Code Organization Principles
- **Feature-based modularization**: Components grouped by domain (course, learning path, projects).
- **UI primitives separated**: Generic UI components in `src/components/ui/` for reuse.
- **TypeScript for type safety**: Interfaces define contracts for data and props.
- **React hooks for logic encapsulation**: Custom hooks abstract reusable logic.
- **Context API for global state**: Search and user progress managed via React Context.

### Testing Strategies & Coverage
- No explicit test files provided, but code structure supports:
  - Unit testing of UI components (stateless, pure functions).
  - Hook testing for custom hooks.
  - Integration testing for pages and context providers.
- Accessibility is supported via Radix UI primitives, easing a11y testing.

### Error Handling & Logging
- Minimal explicit error handling in UI components.
- 404 pages and NotFound components handle routing errors gracefully.
- Logging in `NotFound.tsx` for error reporting.
- Toast notifications used for user feedback.

### Configuration Management Patterns
- Environment variables managed via Vite (`import.meta.env`).
- Path aliases (`@`) configured in Vite for cleaner imports.
- Styling variants managed via `class-variance-authority` (`cva`).
- CSS variables and Tailwind for theming.

---

## 5. Integration and Dependencies

### External Libraries & Their Purposes
- **React & React DOM**: Core UI framework.
- **React Router DOM**: Client-side routing.
- **Radix UI (`@radix-ui/react-*`)**: Accessible UI primitives (dialogs, menus, tooltips, etc.).
- **Lucide React**: SVG icon components.
- **Tailwind CSS**: Utility-first styling framework.
- **React Query (`@tanstack/react-query`)**: Server state management.
- **Sonner**: Toast notifications.
- **Fuse.js**: Fuzzy search implementation.
- **Date-fns**: Date manipulation.
- **Zod**: Schema validation.
- **Class-variance-authority (`cva`)**: Styling variant management.
- **Embla Carousel**: Carousel UI component.
- **Input-OTP**: OTP input UI component.

### Internal Modules & Contracts
- **Static data modules**: Courses, projects, learning paths.
- **TypeScript interfaces**: Define data contracts.
- **Utility functions**: `cn` for className merging.
- **Context providers**: Search and user progress state.

### Build & Deployment Dependencies
- **Vite**: Build tool and dev server.
- **GitHub Actions**: CI/CD pipeline for deployment.
- **PostCSS & Autoprefixer**: CSS processing.
- **Tailwind Plugins**: Animations and theme extensions.

---

## 6. Usage and Operational Guidance

### Local Development
- Clone repository.
- Install dependencies (`npm ci` or `yarn`).
- Run development server (`npm run dev`).
- Access app at configured localhost port.
- Use provided docs (`docs/local-development.md`) for detailed setup.

### Building and Deployment
- Build with `npm run build`.
- Deploy via GitHub Actions pipeline (`.github/workflows/deploy.yml`) or manually using `gh-pages`.
- Use `docs/deployment-guide.md` for deployment instructions and troubleshooting.

### Extending the Codebase
- Add new courses or projects by extending static data files under `src/data/courses/` or `src/data/projects/`.
- Create new UI components in `src/components/ui/` following existing design system patterns (Radix primitives, `cva` styling, forwardRef).
- Manage global state via React Context or custom hooks in `src/context/` or `src/hooks/`.
- Add new pages in `src/pages/` and route them via React Router in `App.tsx`.

### Performance & Scalability
- Static data loaded at build time for fast client-side rendering.
- React Query used for server state caching (if applicable).
- UI components optimized for accessibility and responsiveness.
- Tailwind CSS and `cva` enable scalable styling.

### Security Considerations
- No backend code; security concerns limited to frontend best practices.
- Use environment variables for API keys or secrets.
- Sanitize user inputs in forms.
- Use HTTPS and secure hosting for deployment.

### Monitoring and Observability
- No explicit monitoring implemented.
- Use browser dev tools and React DevTools for debugging.
- Toast notifications provide user feedback on actions.

---

# Summary

This React TypeScript project is a **modular, scalable educational platform** with a strong emphasis on **component-based UI architecture**, **static data-driven content**, and **modern frontend tooling**. It leverages **Radix UI primitives** for accessibility, **Tailwind CSS** for styling, and **React Context** for state management. The codebase is well-organized by domain and UI layers, facilitating maintainability and extensibility.

For developers and AI agents, the repository structure, modular data files, and consistent use of TypeScript interfaces provide clear entry points for understanding and extending the system. The comprehensive documentation and CI/CD pipeline support smooth development and deployment workflows.

---

# Appendix: Key File References

| File/Folder Path                         | Role/Description                                    |
|-----------------------------------------|----------------------------------------------------|
| `src/components/ui/`                     | Reusable UI primitives and design system components|
| `src/components/course/`                 | Course-related UI components                        |
| `src/components/learning-path/`          | Learning path UI components                         |
| `src/components/layout/`                 | Header, navigation, mobile menu                     |
| `src/context/SearchContext.tsx`          | Search state management                             |
| `src/context/UserProgressContext.tsx`    | User progress state management                      |
| `src/data/courses/`                      | Static course data modules                          |
| `src/data/projects/`                     | Static project data modules                         |
| `src/data/learningPaths.ts`              | Static learning path data                           |
| `src/hooks/useCourseFilters.ts`          | Filtering logic hook                               |
| `src/hooks/use-toast.ts`                  | Toast notification hook                            |
| `src/pages/`                            | Route-level React components                        |
| `vite.config.ts`                        | Build and dev server configuration                  |
| `.github/workflows/deploy.yml`           | CI/CD pipeline for deployment                       |
| `docs/`                                | Documentation for deployment, development, troubleshooting |

---

# End of DETAILS.md