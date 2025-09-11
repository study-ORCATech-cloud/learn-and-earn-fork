# Data Structure Guide

This guide provides a detailed explanation of the data models used in the LabDojo Learning Platform and how they interconnect to create a cohesive learning experience.

## Overview

The platform uses three primary data models:
- **Courses** - Individual learning units with structured content
- **Learning Paths** - Curated sequences of courses for specific goals
- **Projects** - Hands-on practical exercises

These models work together to provide a comprehensive learning ecosystem with clear progression paths and practical application opportunities.

## Core Data Models

### Course Model

The `Course` interface defines individual learning units that form the building blocks of the platform.

```typescript
interface Course {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  description: string;           // Brief summary (1-2 sentences)
  longDescription: string;       // Detailed explanation (2-3 sentences)
  level: string;                 // Human-readable level (e.g., "Beginner")
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  duration: string;              // Human-readable duration (e.g., "6-8 weeks")
  icon: string;                  // Emoji icon for visual identification
  iconColor: string;             // Tailwind color class
  color: string;                 // Theme color name
  gradient: string;              // Tailwind gradient classes
  category: string;              // Organizational category
  estimatedHours: number;        // Total learning time in hours
  topics: string[];              // Array of covered topics
  prerequisites: string[];       // Required prior knowledge
  tags: string[];                // Searchable keywords
  resources?: Resource[];        // Optional detailed content
  resourceGroups?: ResourceGroup[]; // Optional grouped resources
  isPopular?: boolean;           // Feature flag for popular content
  isNew?: boolean;               // Feature flag for new content
  lastUpdated: Date;             // Content revision date
}
```

#### Course Properties Explained

**Identification & Display**
- `id` - Must be unique across all courses, used for routing and references
- `title` - User-facing name displayed in cards and headers
- `description` - Concise value proposition shown in course cards
- `longDescription` - Detailed explanation used on course detail pages

**Classification & Difficulty**
- `level` - Flexible string for marketing purposes ("Beginner", "Professional")
- `difficulty` - Strict enum for filtering and progression logic
- `category` - Groups courses by domain (e.g., "DevOps", "Programming")

**Visual Design**
- `icon` - Emoji representing the course topic
- `iconColor` - Tailwind text color class for consistency
- `color` - Base color name used in design system
- `gradient` - Tailwind gradient classes for visual appeal

**Learning Metadata**
- `estimatedHours` - Used for progress tracking and time planning
- `duration` - Human-friendly time estimate
- `topics` - Granular subject areas covered
- `prerequisites` - Dependencies for learning path ordering

**Content & Resources**
- `resources` - Flat array of learning materials
- `resourceGroups` - Organized sections of resources with titles

**Discoverability**
- `tags` - Keywords for search and filtering
- `isPopular`/`isNew` - Feature flags for highlighting content
- `lastUpdated` - Helps users find current information

### Resource Model

Resources represent individual learning materials within courses.

```typescript
interface Resource {
  id: string;                    // Unique identifier
  title: string;                 // Resource name
  description: string;           // What the resource covers
  type: 'video' | 'article' | 'lab' | 'quiz' | 'project';
  url: string;                   // Link to content
  tags: string[];                // Searchable keywords
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;              // Human-readable time
  estimatedMinutes: number;      // Numeric duration for calculations
  isCompleted?: boolean;         // User progress tracking
  prerequisites?: string[];      // Resource dependencies
  isExternal?: boolean;          // External link flag
  lastUpdated?: Date;            // Content revision date
  isInteractive?: boolean;       // Hands-on activity flag
}
```

#### Resource Types

**video** - Video tutorials and lectures
**article** - Written documentation and guides  
**lab** - Hands-on exercises and tutorials
**quiz** - Knowledge assessments
**project** - Practical application exercises

### ResourceGroup Model

Groups resources into logical sections within courses.

```typescript
interface ResourceGroup {
  title: string;                 // Section name
  description: string;           // Section purpose
  resources: Resource[];         // Array of related resources
}
```

### Learning Path Model

Learning paths define curated educational journeys using multiple courses.

```typescript
interface LearningPath {
  id: string;                    // Unique identifier
  title: string;                 // Path name
  description: string;           // Brief overview
  longDescription: string;       // Detailed journey explanation
  icon: string;                  // Visual identifier
  iconColor: string;             // Theme color
  gradient: string;              // Visual gradient
  category: string;              // Domain classification
  estimatedHours: number;        // Total time investment
  courseIds: string[];           // Ordered course sequence
  courseGroups?: CourseGroup[];  // Grouped course organization
  tags: string[];                // Search keywords
  isPopular?: boolean;           // Feature flag
  isNew?: boolean;               // Feature flag
  lastUpdated: Date;             // Revision date
}
```

#### Course Sequencing

Learning paths define course progression through:
- `courseIds` - Simple ordered array of course identifiers
- `courseGroups` - Grouped courses with descriptive sections

### CourseGroup Model

Organizes courses within learning paths into logical stages.

```typescript
interface CourseGroup {
  title: string;                 // Stage name (e.g., "Foundation")
  description: string;           // Stage purpose
  courseIds: string[];           // Courses in this stage
}
```

### Project Model

Projects provide hands-on application of learned skills.

```typescript
interface Project {
  id: string;                    // Unique identifier
  title: string;                 // Project name
  description: string;           // Brief overview
  longDescription: string;       // Detailed project explanation
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;        // Time to complete
  category: 'Python' | 'Docker' | 'Kubernetes' | 'CI/CD' | 'IaC';
  tags: string[];                // Technology keywords
  prerequisites: string[];       // Required knowledge
  objectives: string[];          // Learning goals
  deliverables: string[];        // Expected outputs
  resources: ProjectResource[];  // Supporting materials
  isPopular?: boolean;           // Feature flag
  isNew?: boolean;               // Feature flag
  lastUpdated: Date;             // Revision date
}
```

### ProjectResource Model

Supporting materials for project completion.

```typescript
interface ProjectResource {
  id: string;                    // Unique identifier
  title: string;                 // Resource name
  description: string;           // Resource purpose
  type: 'Repository' | 'Documentation' | 'Tutorial' | 'Reference';
  url: string;                   // Resource location
  isExternal: boolean;           // External link flag
}
```

## Data Relationships

### Course ↔ Learning Path Relationship

Learning paths reference courses through `courseIds` arrays:

```typescript
// Learning path definition
{
  id: 'devops-engineer',
  courseIds: ['docker-beginner', 'kubernetes-intermediate', 'cicd-fundamentals']
}

// Course resolution
const courses = learningPath.courseIds.map(id => 
  allCourses.find(course => course.id === id)
);
```

### Course ↔ Resource Relationship

Courses contain resources either directly or through groups:

```typescript
// Direct resources
{
  id: 'docker-beginner',
  resources: [
    { id: 'docker-intro', title: 'Docker Introduction' },
    { id: 'first-container', title: 'Your First Container' }
  ]
}

// Grouped resources
{
  id: 'kubernetes-advanced',
  resourceGroups: [
    {
      title: 'Core Concepts',
      resources: [
        { id: 'k8s-architecture', title: 'Kubernetes Architecture' }
      ]
    }
  ]
}
```

### Prerequisites Chain

Prerequisites create dependency relationships:

```typescript
// Course prerequisites
{
  id: 'kubernetes-intermediate',
  prerequisites: ['Docker Beginner', 'Basic networking']
}

// Resource prerequisites  
{
  id: 'advanced-k8s-lab',
  prerequisites: ['kubernetes-basics']
}
```

## Data Organization

### File Structure

```
src/data/
├── courses/
│   ├── index.ts              // Main course aggregation
│   ├── programming.ts        // Programming courses
│   ├── cloud.ts             // Cloud computing courses
│   ├── docker.ts            // Docker courses
│   ├── kubernetes.ts        // Kubernetes courses
│   ├── cicd.ts              // CI/CD courses
│   ├── iac.ts               // Infrastructure as Code
│   └── expert/              // Advanced courses
│       ├── kubernetes-expert.ts
│       ├── devops-expert.ts
│       └── ...
├── projects/
│   ├── index.ts             // Project aggregation
│   ├── python.ts            // Python projects
│   ├── docker.ts            // Docker projects
│   ├── kubernetes.ts        // Kubernetes projects
│   ├── cicd.ts              // CI/CD projects
│   └── iac.ts               // IaC projects
└── learningPaths.ts         // All learning paths
```

### Data Aggregation

The main index files aggregate related content:

```typescript
// src/data/courses/index.ts
export const courses: Course[] = [
  ...programmingCourses,
  ...cloudCourses,
  ...dockerCourses,
  ...kubernetesCourses,
  ...expertCourses
];

// src/data/projects/index.ts
export const allProjects = [
  ...pythonProjects,
  ...dockerProjects,
  ...kubernetesProjects
];
```

## Data Validation Patterns

### ID Consistency

All identifiers follow kebab-case naming:
- Courses: `docker-beginner`, `kubernetes-expert`
- Projects: `k8s-microservices`, `python-web-scraper`
- Learning Paths: `devops-engineer`, `cloud-architect`

### Date Handling

All dates use JavaScript Date objects:
```typescript
lastUpdated: new Date('2024-01-25')
```

### Required vs Optional Fields

**Always Required:**
- `id`, `title`, `description`, `lastUpdated`
- Category and difficulty classifications
- Time estimates (`estimatedHours`, `duration`)

**Contextually Optional:**
- `resources` - Only needed for detailed courses
- `isPopular`/`isNew` - Feature flags
- `prerequisites` - May be empty for beginner content

## Search & Filtering Models

### SearchFilters Interface

```typescript
interface SearchFilters {
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  tags?: string[];
  duration?: string;
}
```

### SearchItem Interface

Unified search results across content types:

```typescript
interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'path' | 'resource';
  url: string;
  tags: string[];
  category: string;
  difficulty: string;
}
```

## User Progress Integration

### UserProgress Model

Tracks individual learner advancement:

```typescript
interface UserProgress {
  userId: string;
  completedResources: string[];    // Resource IDs
  favorites: string[];             // Content IDs
  lastAccessed: Date;
  totalHours: number;
  achievements: string[];
  preferences: {
    theme: 'light' | 'dark';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    interests: string[];
    notifications: boolean;
  };
}
```

## Data Flow Patterns

### Content Discovery Flow

1. **Browse by Category** - Filter courses by domain
2. **Search by Keywords** - Match against titles, descriptions, tags
3. **Filter by Difficulty** - Progressive skill building
4. **Duration Filtering** - Time-based selection

### Learning Progression Flow

1. **Learning Path Selection** - Choose career-focused journey
2. **Course Sequence** - Follow prerequisite-based progression  
3. **Resource Completion** - Track individual material progress
4. **Project Application** - Apply skills in practical exercises

### Content Relationship Resolution

```typescript
// Get all courses in a learning path
const getPathCourses = (pathId: string): Course[] => {
  const path = learningPaths.find(p => p.id === pathId);
  return path?.courseIds.map(id => 
    courses.find(c => c.id === id)
  ).filter(Boolean) || [];
};

// Get related projects for a course
const getRelatedProjects = (course: Course): Project[] => {
  return projects.filter(project => 
    project.category === course.category ||
    project.tags.some(tag => course.tags.includes(tag))
  );
};
```

## Best Practices

### Data Integrity

1. **Unique IDs** - Ensure no duplicate identifiers across content types
2. **Valid References** - All `courseIds` must reference existing courses
3. **Consistent Categories** - Use standardized category names
4. **Accurate Prerequisites** - Verify dependency chains are valid

### Performance Considerations

1. **Lazy Loading** - Load detailed resources only when needed
2. **Indexed Searches** - Use efficient search libraries (e.g., Fuse.js)
3. **Cached Aggregations** - Pre-compute expensive relationship queries
4. **Minimal Data Transfer** - Only send required fields to frontend

### Content Maintenance

1. **Regular Updates** - Keep `lastUpdated` dates current
2. **Link Validation** - Verify external URLs remain accessible
3. **Prerequisite Validation** - Ensure learning paths remain coherent
4. **Tag Consistency** - Maintain standardized tagging vocabulary

## Migration Strategies

### Adding New Fields

When extending models, use optional fields with sensible defaults:

```typescript
// Safe addition
interface Course {
  // ... existing fields
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  newField?: string; // Optional to maintain backward compatibility
}
```

### Restructuring Data

For major changes, implement gradual migration:

1. Add new structure alongside existing
2. Populate new fields from existing data
3. Update consuming code to use new structure
4. Remove deprecated fields

### Version Management

Track data schema versions for safe updates:

```typescript
interface DataVersion {
  version: string;
  lastMigration: Date;
  supportedVersions: string[];
}
```

---

This data structure guide provides the foundation for understanding how content flows through the LabDojo Learning Platform. For implementation details, see the [Architecture Overview](./architecture-overview.md) and [Content Management Guide](./content-management.md).
