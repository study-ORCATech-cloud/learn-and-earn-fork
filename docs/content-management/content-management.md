
# Content Management Guide

This guide explains how to add, edit, and manage educational content in the LabDojo Learning Platform.

## Overview

The platform consists of three main content types:
- **Courses** - Individual learning units with resources and topics
- **Learning Paths** - Curated sequences of courses for specific career goals
- **Projects** - Hands-on practical exercises to apply learned skills

## Content Structure

### Data Location
- **Courses**: `src/data/courses/`
- **Learning Paths**: `src/data/learningPaths.ts`
- **Projects**: `src/data/projects/`
- **Types**: `src/types/learningPath.ts` and `src/types/project.ts`

### File Organization
```
src/data/
├── courses/
│   ├── index.ts          # Main course export
│   ├── programming.ts    # Programming courses
│   ├── web.ts           # Web development courses
│   ├── cloud.ts         # Cloud computing courses
│   ├── kubernetes.ts    # Kubernetes courses
│   ├── docker.ts        # Docker courses
│   ├── git.ts           # Git & GitHub courses
│   ├── sysadmin.ts      # System administration courses
│   ├── cicd.ts          # CI/CD courses
│   ├── iac.ts           # Infrastructure as Code courses
│   └── expert/          # Expert-level courses
│       ├── kubernetes-expert.ts
│       ├── devops-expert.ts
│       ├── cicd-expert.ts
│       ├── programming-expert.ts
│       └── python-cloud-expert.ts
├── projects/
│   ├── index.ts         # Main project export
│   ├── python.ts        # Python projects
│   ├── docker.ts        # Docker projects
│   ├── kubernetes.ts    # Kubernetes projects
│   ├── cicd.ts          # CI/CD projects
│   └── iac.ts           # Infrastructure projects
└── learningPaths.ts     # All learning paths
```

## Adding New Content

### Adding a New Course

1. **Choose the appropriate category file** in `src/data/courses/`
2. **Define the course object** following the `Course` interface:

```typescript
{
  id: 'unique-course-id',
  title: 'Course Title',
  description: 'Brief description (1-2 sentences)',
  longDescription: 'Detailed description (2-3 sentences)',
  icon: '🎯', // Relevant emoji
  iconColor: 'text-blue-400', // Tailwind color class
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional',
  duration: '6-8 weeks', // Human-readable duration
  color: 'blue', // Theme color name
  gradient: 'from-blue-500 to-cyan-500', // Tailwind gradient
  category: 'Category Name',
  topics: ['Topic 1', 'Topic 2'], // Array of covered topics
  prerequisites: ['Required knowledge'], // Prerequisites
  estimatedHours: 75, // Total hours to complete
  tags: ['tag1', 'tag2'], // Searchable tags
  isNew: true, // Optional: mark as new
  isPopular: true, // Optional: mark as popular
  lastUpdated: new Date('2024-01-25'),
  resources: [] // Array of Resource objects (see below)
}
```

3. **Add resources** if the course has detailed content:

```typescript
resources: [
  {
    id: 'resource-id',
    title: 'Resource Title',
    description: 'What the resource covers',
    type: 'lab' | 'video' | 'article' | 'quiz' | 'project',
    url: 'https://github.com/repo/path',
    tags: ['tag1', 'tag2'],
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    duration: '1.5 hours', // Human-readable
    estimatedMinutes: 90, // Numeric value
    prerequisites: ['prerequisite'], // Optional
    isExternal: true, // If linking to external resource
    isInteractive: true, // If hands-on lab/exercise
    lastUpdated: new Date('2024-01-25')
  }
]
```

4. **Export the course** in the category file and add to the main export in `src/data/courses/index.ts`

### Adding a New Learning Path

1. **Open** `src/data/learningPaths.ts`
2. **Add the learning path object**:

```typescript
{
  id: 'learning-path-id',
  title: 'Learning Path Title',
  description: 'Brief description',
  longDescription: 'Detailed description explaining the journey',
  icon: '🚀', // Relevant emoji
  iconColor: 'text-blue-400',
  gradient: 'from-blue-500 to-cyan-500',
  category: 'Category Name',
  estimatedHours: 280, // Sum of all course hours
  courseIds: ['course-id-1', 'course-id-2'], // Ordered array
  courseGroups: [ // Optional: group courses by learning stage
    {
      title: 'Foundation',
      description: 'Essential basics',
      courseIds: ['course-1', 'course-2']
    }
  ],
  tags: ['tag1', 'tag2'],
  isPopular: true, // Optional
  isNew: true, // Optional
  lastUpdated: new Date('2024-01-25')
}
```

### Adding a New Project

1. **Choose the appropriate category file** in `src/data/projects/`
2. **Define the project object**:

```typescript
{
  id: 'project-id',
  title: 'Project Title',
  description: 'Brief project description',
  longDescription: 'Detailed explanation of what will be built',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  estimatedHours: 12,
  category: 'Python' | 'Docker' | 'Kubernetes' | 'CI/CD' | 'IaC',
  tags: ['tag1', 'tag2'],
  prerequisites: ['Required knowledge'],
  objectives: [
    'Learning objective 1',
    'Learning objective 2'
  ],
  deliverables: [
    'What will be created',
    'Documentation to be written'
  ],
  resources: [
    {
      id: 'resource-id',
      title: 'Resource Title',
      description: 'Resource description',
      type: 'Repository' | 'Documentation' | 'Tutorial' | 'Reference',
      url: 'https://example.com',
      isExternal: true
    }
  ],
  isPopular: true, // Optional
  isNew: true, // Optional
  lastUpdated: new Date('2024-01-25')
}
```

3. **Export the project** and add to the main export in `src/data/projects/index.ts`

## Content Guidelines

### Writing Descriptions
- **Brief descriptions**: 1-2 sentences, focus on core value proposition
- **Long descriptions**: 2-3 sentences, explain the learning journey and outcomes
- Use active voice and learner-focused language
- Avoid jargon; explain technical terms when necessary

### Choosing Difficulty Levels
- **Beginner**: No prior experience required, foundational concepts
- **Intermediate**: Some experience expected, building on basics
- **Advanced**: Significant experience required, complex topics
- **Professional**: Expert-level, enterprise/production focus

### Estimating Hours
- **Courses**: Include time for reading, labs, and practice
- **Projects**: Account for setup, development, testing, and documentation
- **Learning Paths**: Sum of individual course hours

### Tags and Categories
- Use consistent, searchable terms
- Include technology names, concepts, and skill levels
- Categories should align with career paths and skill domains

### Prerequisites
- List specific knowledge or completed courses
- Be explicit about required tools or environments
- Consider both technical and conceptual prerequisites

## Updating Existing Content

### Modifying Course Content
1. Locate the course in the appropriate category file
2. Update the relevant fields
3. **Always update** the `lastUpdated` date
4. If adding/removing resources, update `estimatedHours` accordingly

### Updating Learning Paths
1. When adding/removing courses, update:
   - `courseIds` array
   - `courseGroups` if applicable
   - `estimatedHours` (sum of all courses)
   - `lastUpdated` date

### Versioning Content
- Use `isNew: true` for content less than 30 days old
- Use `isPopular: true` for highly-engaged content
- Update `lastUpdated` dates when making significant changes

## Content Review Process

### Before Adding Content
1. **Verify uniqueness**: Ensure no duplicate IDs exist
2. **Check dependencies**: Confirm all referenced courses exist
3. **Validate structure**: Ensure all required fields are present
4. **Test locally**: Run the development server to verify content displays correctly

### Quality Checklist
- [ ] All required fields completed
- [ ] Descriptions are clear and learner-focused
- [ ] Prerequisites are accurate and specific
- [ ] Hours estimation is realistic
- [ ] Tags are relevant and searchable
- [ ] Icons and colors follow design system
- [ ] Links are functional (for external resources)
- [ ] Content follows accessibility guidelines

## Common Patterns

### Expert Course Naming
- Use format: `{technology}-expert` (e.g., `kubernetes-expert`)
- Place in `src/data/courses/expert/` directory
- Include advanced topics like enterprise patterns, security, optimization

### Resource URLs
- **Internal labs**: Use GitHub repository structure
- **External resources**: Include full URLs with `isExternal: true`
- **Documentation**: Link to official docs when possible

### Course Progression
- **Beginner → Intermediate → Advanced → Expert/Professional**
- Each level should build on previous knowledge
- Clear prerequisite chains help learners plan their journey

## Troubleshooting

### Common Issues
- **Build errors**: Check for missing commas, brackets, or quotes
- **Content not displaying**: Verify the content is exported in index files
- **Broken links**: Test all external URLs regularly
- **TypeScript errors**: Ensure all fields match interface definitions

### Validation
- Use TypeScript compiler to catch type errors
- Test responsive design on different screen sizes
- Verify search functionality works with new tags
- Check that filtering works correctly with new categories

## Content Maintenance

### Regular Tasks
- Review and update external links quarterly
- Update course hours based on learner feedback
- Refresh content marked as "new" after 30 days
- Monitor popular content and ensure it stays current

### Analytics Integration
- Track course completion rates
- Monitor popular search terms for content gaps
- Review user feedback for content improvements
- Identify areas needing additional resources

---

For technical implementation details, see:
- [Data Structure Guide](./data-structure-guide.md)
- [Architecture Overview](./architecture-overview.md)
- [Contributing Guidelines](./contributing.md)
