
# Component Library Documentation

This document provides comprehensive documentation for all UI components available in the LabDojo Learning Platform. Components are organized by category and include usage examples, props, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Layout Components](#layout-components)
4. [Navigation Components](#navigation-components)
5. [Content Components](#content-components)
6. [Form Components](#form-components)
7. [Feedback Components](#feedback-components)
8. [Data Display Components](#data-display-components)
9. [Utility Components](#utility-components)
10. [Shadcn/UI Components](#shadcnui-components)
11. [Best Practices](#best-practices)

## Overview

The component library is built on top of:
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** for base components
- **Lucide React** for icons
- **Radix UI** primitives for accessibility

All components follow consistent design patterns and are fully responsive.

## Design System

### Color System
The platform uses a semantic color system defined in `src/index.css`:

```css
/* Primary colors */
--primary: 222.2 84% 4.9%
--primary-foreground: 210 40% 98%

/* Secondary colors */
--secondary: 210 40% 96%
--secondary-foreground: 222.2 84% 4.9%

/* Accent colors */
--accent: 210 40% 96%
--accent-foreground: 222.2 84% 4.9%
```

### Typography
- **Headings**: Use semantic heading tags (h1-h6) with Tailwind classes
- **Body text**: Base text size with proper line height
- **Code**: Monospace font for code snippets

### Spacing
Follow Tailwind's spacing scale (0.25rem increments) for consistent layouts.

## Layout Components

### Header
**Location**: `src/components/layout/Header.tsx`

Main navigation header with logo, navigation links, and search functionality.

```tsx
import { Header } from '@/components/layout/Header'

<Header />
```

**Features**:
- Responsive navigation
- Mobile hamburger menu
- Search integration
- Logo placement

### Navigation
**Location**: `src/components/layout/Navigation.tsx`

Desktop navigation component with active state management.

```tsx
import { Navigation } from '@/components/layout/Navigation'

<Navigation />
```

**Features**:
- Active route highlighting
- Dropdown menus
- Hover effects

### MobileMenu
**Location**: `src/components/layout/MobileMenu.tsx`

Collapsible mobile navigation menu.

```tsx
import { MobileMenu } from '@/components/layout/MobileMenu'

<MobileMenu />
```

**Props**:
- `isOpen: boolean` - Controls menu visibility
- `onClose: () => void` - Close handler

## Navigation Components

### SearchBar
**Location**: `src/components/layout/SearchBar.tsx`

Global search component with fuzzy search capabilities.

```tsx
import { SearchBar } from '@/components/layout/SearchBar'

<SearchBar 
  placeholder="Search courses, paths, projects..."
  onSearch={(query) => console.log(query)}
/>
```

**Props**:
- `placeholder?: string` - Input placeholder text
- `onSearch?: (query: string) => void` - Search callback

## Content Components

### CourseCard
**Location**: `src/components/ui/CourseCard.tsx`

Displays course information in a card format.

```tsx
import { CourseCard } from '@/components/ui/CourseCard'

<CourseCard
  id="python-basics"
  title="Python Fundamentals"
  description="Learn Python programming from scratch"
  duration="4 weeks"
  level="Beginner"
  technologies={["Python", "Git"]}
  lessons={[]}
/>
```

**Props**:
- `id: string` - Unique course identifier
- `title: string` - Course title
- `description: string` - Course description
- `duration: string` - Estimated completion time
- `level: 'Beginner' | 'Intermediate' | 'Advanced'` - Difficulty level
- `technologies: string[]` - Technology stack
- `lessons: Lesson[]` - Course lessons

### LearningPathCard
**Location**: `src/components/ui/LearningPathCard.tsx`

Displays learning path information.

```tsx
import { LearningPathCard } from '@/components/ui/LearningPathCard'

<LearningPathCard
  id="devops-path"
  title="DevOps Engineer"
  description="Complete DevOps learning journey"
  duration="12 weeks"
  level="Intermediate"
  courses={["docker", "kubernetes", "cicd"]}
/>
```

**Props**:
- `id: string` - Path identifier
- `title: string` - Path title
- `description: string` - Path description
- `duration: string` - Estimated completion time
- `level: string` - Difficulty level
- `courses: string[]` - Course IDs in the path

### ProjectCard
**Location**: `src/components/ui/ProjectCard.tsx`

Displays project information and requirements.

```tsx
import { ProjectCard } from '@/components/ui/ProjectCard'

<ProjectCard
  id="web-app-project"
  title="Full Stack Web Application"
  description="Build a complete web application"
  difficulty="Intermediate"
  estimatedTime="2-3 weeks"
  technologies={["React", "Node.js", "MongoDB"]}
  objectives={["Create REST API", "Implement authentication"]}
/>
```

**Props**:
- `id: string` - Project identifier
- `title: string` - Project title
- `description: string` - Project description
- `difficulty: string` - Project difficulty
- `estimatedTime: string` - Time estimate
- `technologies: string[]` - Required technologies
- `objectives: string[]` - Learning objectives

### ResourceCard
**Location**: `src/components/course/ResourceCard.tsx`

Displays individual learning resources.

```tsx
import { ResourceCard } from '@/components/course/ResourceCard'

<ResourceCard
  title="Official Documentation"
  description="Comprehensive guide to the technology"
  type="documentation"
  url="https://example.com/docs"
  estimatedTime="30 minutes"
/>
```

**Props**:
- `title: string` - Resource title
- `description: string` - Resource description
- `type: 'video' | 'article' | 'documentation' | 'tutorial'` - Resource type
- `url: string` - Resource URL
- `estimatedTime?: string` - Reading/viewing time

## Form Components

All form components are built on Shadcn/UI and React Hook Form for consistency and accessibility.

### Basic Form Example

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
})

function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Feedback Components

### Toast Notifications

```tsx
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  const showSuccess = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
    })
  }

  const showError = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    })
  }

  return (
    <div>
      <Button onClick={showSuccess}>Show Success</Button>
      <Button onClick={showError}>Show Error</Button>
    </div>
  )
}
```

### Progress Indicators

```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={33} className="w-full" />
```

## Data Display Components

### Badges

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Beginner</Badge>
<Badge variant="secondary">Python</Badge>
<Badge variant="outline">4 weeks</Badge>
```

### Cards

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Utility Components

### Icons
Using Lucide React for consistent iconography:

```tsx
import { BookOpen, Code, Users, Zap } from 'lucide-react'

<BookOpen className="h-4 w-4" />
<Code className="h-6 w-6 text-primary" />
```

### Separators

```tsx
import { Separator } from '@/components/ui/separator'

<Separator className="my-4" />
<Separator orientation="vertical" className="h-4" />
```

## Shadcn/UI Components

The platform includes all standard Shadcn/UI components. Key components include:

- **Button**: Primary interaction element
- **Input**: Text input fields
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Boolean input
- **Radio Group**: Single selection from options
- **Dialog**: Modal overlays
- **Popover**: Contextual overlays
- **Tooltip**: Hover information
- **Accordion**: Collapsible content
- **Tabs**: Content organization
- **Sheet**: Side panel overlay

### Button Variants

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Dialog Example

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a dialog description.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

## Best Practices

### Component Organization
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use component composition for flexibility
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Provide sensible defaults where appropriate

### Styling Guidelines
1. **Use Semantic Colors**: Reference CSS custom properties instead of hardcoded colors
2. **Responsive Design**: Use Tailwind responsive prefixes (sm:, md:, lg:, xl:)
3. **Consistent Spacing**: Follow Tailwind spacing scale
4. **Accessibility**: Ensure proper contrast ratios and keyboard navigation

### Performance Considerations
1. **Lazy Loading**: Use React.lazy() for large components
2. **Memoization**: Use React.memo() for expensive renders
3. **Bundle Splitting**: Keep component files focused and small
4. **Icon Optimization**: Import only needed icons from Lucide React

### Accessibility Standards
1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Maintain logical focus order

### Error Handling
1. **Error Boundaries**: Wrap components that might fail
2. **Loading States**: Show loading indicators for async operations
3. **Empty States**: Provide helpful messages when no data is available
4. **Validation**: Use Zod schemas for form validation

### Testing
1. **Unit Tests**: Test component logic and props
2. **Integration Tests**: Test component interactions
3. **Accessibility Tests**: Verify WCAG compliance
4. **Visual Regression**: Test UI consistency

## Contributing to Components

When adding new components:

1. **Follow Naming Conventions**: Use PascalCase for component names
2. **Add TypeScript Types**: Define proper interfaces
3. **Include Documentation**: Add JSDoc comments
4. **Write Tests**: Include unit tests
5. **Update This Guide**: Document new components here

### Component Template

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title to display
   */
  title: string
  /**
   * Additional content
   */
  children?: React.ReactNode
  /**
   * Variant styling
   */
  variant?: 'default' | 'secondary'
}

/**
 * MyComponent description
 * 
 * @example
 * <MyComponent title="Hello World">
 *   <p>Content here</p>
 * </MyComponent>
 */
export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, title, children, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-styles-here',
          {
            'default-variant-styles': variant === 'default',
            'secondary-variant-styles': variant === 'secondary',
          },
          className
        )}
        {...props}
      >
        <h2>{title}</h2>
        {children}
      </div>
    )
  }
)

MyComponent.displayName = 'MyComponent'
```

This component library documentation should be updated whenever new components are added or existing ones are modified.
