
# Styling Guide

This document provides comprehensive guidelines for styling in the LabDojo Learning Platform, covering Tailwind CSS conventions, design system principles, and theming standards.

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing and Layout](#spacing-and-layout)
6. [Components and Variants](#components-and-variants)
7. [Responsive Design](#responsive-design)
8. [Dark Mode and Theming](#dark-mode-and-theming)
9. [Tailwind Configuration](#tailwind-configuration)
10. [Best Practices](#best-practices)
11. [Common Patterns](#common-patterns)
12. [Performance Considerations](#performance-considerations)

## Overview

The LabDojo Learning Platform uses a systematic approach to styling built on:

- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theming and design tokens
- **Shadcn/UI** components for consistent UI patterns
- **HSL Color System** for better color manipulation
- **Semantic Design Tokens** for maintainable theming

## Design System

### Design Principles

1. **Consistency**: Use predefined design tokens and spacing scales
2. **Accessibility**: Ensure proper contrast ratios and keyboard navigation
3. **Responsiveness**: Mobile-first design with progressive enhancement
4. **Performance**: Minimize CSS bundle size through utility classes
5. **Maintainability**: Use semantic tokens over hardcoded values

### Design Tokens Structure

```css
/* CSS Custom Properties in src/index.css */
:root {
  /* Semantic colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  
  /* Component-specific tokens */
  --card: 0 0% 100%;
  --popover: 0 0% 100%;
  --muted: 210 40% 96.1%;
  
  /* Border and effects */
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

## Color System

### Color Philosophy

- **HSL Format**: All colors use HSL (Hue, Saturation, Lightness) for better manipulation
- **Semantic Naming**: Colors are named by purpose, not appearance
- **Automatic Dark Mode**: CSS custom properties automatically switch themes
- **Accessible Contrast**: All color combinations meet WCAG AA standards

### Primary Color Palette

```css
/* Light Mode */
--background: 0 0% 100%;          /* Pure white */
--foreground: 222.2 84% 4.9%;     /* Dark text */
--primary: 222.2 47.4% 11.2%;     /* Brand primary */
--secondary: 210 40% 96.1%;       /* Light gray */
--muted: 210 40% 96.1%;           /* Subtle backgrounds */
--accent: 210 40% 96.1%;          /* Accent elements */

/* Dark Mode */
--background: 222.2 84% 4.9%;     /* Dark background */
--foreground: 210 40% 98%;        /* Light text */
--primary: 210 40% 98%;           /* Inverted primary */
--secondary: 217.2 32.6% 17.5%;   /* Dark gray */
```

### Color Usage Guidelines

#### Do's
```jsx
// ✅ Use semantic color classes
<div className="bg-background text-foreground">
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card border-border">

// ✅ Use color variants for states
<div className="hover:bg-accent hover:text-accent-foreground">
<Button variant="destructive">Delete</Button>
```

#### Don'ts
```jsx
// ❌ Avoid hardcoded colors
<div className="bg-white text-black">
<div className="bg-blue-500 text-white">

// ❌ Don't use arbitrary values for brand colors
<div className="bg-[#ffffff]">
```

### State Colors

```css
/* Semantic state colors */
--destructive: 0 84.2% 60.2%;     /* Error/danger states */
--warning: 38 92% 50%;            /* Warning states */
--success: 142 76% 36%;           /* Success states */
--info: 204 94% 94%;              /* Informational states */
```

## Typography

### Font System

The platform uses a carefully selected font stack with fallbacks:

```css
/* Font families */
font-family: 
  system-ui, 
  -apple-system, 
  BlinkMacSystemFont, 
  "Segoe UI", 
  Roboto, 
  sans-serif;
```

### Typography Scale

```css
/* Text sizes following Tailwind's scale */
text-xs    → 0.75rem (12px)
text-sm    → 0.875rem (14px)
text-base  → 1rem (16px)        /* Body text */
text-lg    → 1.125rem (18px)
text-xl    → 1.25rem (20px)
text-2xl   → 1.5rem (24px)      /* H4 */
text-3xl   → 1.875rem (30px)    /* H3 */
text-4xl   → 2.25rem (36px)     /* H2 */
text-5xl   → 3rem (48px)        /* H1 */
```

### Typography Patterns

```jsx
// Headings
<h1 className="text-4xl font-bold tracking-tight">Main Heading</h1>
<h2 className="text-3xl font-semibold">Section Heading</h2>
<h3 className="text-2xl font-medium">Subsection</h3>

// Body text
<p className="text-base leading-relaxed">Regular paragraph text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>

// Special text
<code className="text-sm font-mono bg-muted px-1 rounded">inline code</code>
<span className="font-semibold text-primary">Emphasized text</span>
```

## Spacing and Layout

### Spacing Scale

Follow Tailwind's spacing scale (0.25rem increments):

```css
/* Spacing values */
p-1  → 0.25rem (4px)
p-2  → 0.5rem (8px)
p-3  → 0.75rem (12px)
p-4  → 1rem (16px)        /* Base unit */
p-6  → 1.5rem (24px)
p-8  → 2rem (32px)
p-12 → 3rem (48px)
p-16 → 4rem (64px)
```

### Layout Patterns

```jsx
// Container layouts
<div className="container mx-auto px-4">          // Main container
<div className="max-w-4xl mx-auto">              // Content width
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">  // Responsive grid

// Card layouts
<Card className="p-6 space-y-4">                 // Card content
<CardHeader className="space-y-1.5">             // Card header
<CardContent className="space-y-3">              // Card body

// Flex layouts
<div className="flex items-center justify-between">      // Header pattern
<div className="flex flex-col space-y-2">               // Vertical stack
<div className="flex items-center space-x-2">           // Horizontal group
```

## Components and Variants

### Button System

```jsx
// Primary actions
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>

// Secondary actions  
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="link">Link Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Regular</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Form Components

```jsx
// Input styling
<Input className="w-full" placeholder="Enter text..." />
<Textarea className="min-h-[100px] resize-none" />

// Form layout
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <FormField>...</FormField>
    <FormField>...</FormField>
  </div>
</div>
```

### Navigation Components

```jsx
// Navigation patterns
<nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      // Navigation content
    </div>
  </div>
</nav>
```

## Responsive Design

### Breakpoint System

```css
/* Tailwind breakpoints */
sm:   640px   /* Small screens */
md:   768px   /* Medium screens */
lg:   1024px  /* Large screens */
xl:   1280px  /* Extra large screens */
2xl:  1536px  /* 2X large screens */
```

### Mobile-First Approach

```jsx
// Start with mobile, enhance for larger screens
<div className="
  p-4 text-sm              // Mobile defaults
  md:p-6 md:text-base      // Tablet adjustments
  lg:p-8 lg:text-lg        // Desktop enhancements
">
  Content
</div>

// Grid responsiveness
<div className="
  grid grid-cols-1         // Mobile: single column
  md:grid-cols-2           // Tablet: two columns
  lg:grid-cols-3           // Desktop: three columns
  gap-4 md:gap-6           // Responsive gaps
">
```

### Common Responsive Patterns

```jsx
// Hide/show elements
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">

// Responsive spacing
<div className="space-y-4 md:space-y-6 lg:space-y-8">
```

## Dark Mode and Theming

### Theme Implementation

The platform uses CSS custom properties for automatic theme switching:

```css
/* Light theme (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Theme-Aware Components

```jsx
// Components automatically inherit theme colors
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <Button className="bg-primary text-primary-foreground">
      Action
    </Button>
  </Card>
</div>
```

### Custom Theme Colors

```css
/* Adding custom theme colors */
:root {
  --brand-blue: 217 91% 60%;
  --brand-green: 142 76% 36%;
}

.dark {
  --brand-blue: 217 91% 70%;
  --brand-green: 142 76% 46%;
}
```

## Tailwind Configuration

### Extended Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Semantic colors
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

### Custom Utilities

```css
/* Custom utility classes */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .glass {
    @apply backdrop-blur-sm bg-background/80 border border-border/20;
  }
  
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }
}
```

## Best Practices

### Class Organization

```jsx
// Group classes logically
<div className="
  // Layout
  flex items-center justify-between
  // Spacing
  p-4 space-x-2
  // Appearance
  bg-card border rounded-lg
  // States
  hover:bg-accent focus:ring-2
  // Responsive
  md:p-6 lg:p-8
">
```

### Component Styling

```jsx
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils"

const Button = ({ className, variant, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium",
        // Variants
        {
          "bg-primary text-primary-foreground": variant === "default",
          "bg-destructive text-destructive-foreground": variant === "destructive",
        },
        // Additional classes
        className
      )}
      {...props}
    />
  )
}
```

### Performance Optimization

```jsx
// Prefer utility classes over custom CSS
// ✅ Good
<div className="bg-primary hover:bg-primary/90 transition-colors">

// ❌ Avoid
<div className="custom-button">
// with custom CSS file
```

## Common Patterns

### Card Layouts

```jsx
<Card className="overflow-hidden">
  <CardHeader className="bg-muted/50">
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <div className="space-y-4">
      // Content
    </div>
  </CardContent>
  <CardFooter className="bg-muted/20 px-6 py-4">
    <Button className="ml-auto">Action</Button>
  </CardFooter>
</Card>
```

### Form Layouts

```jsx
<form className="space-y-6">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <FormField>
      <FormLabel>First Name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
      <FormMessage />
    </FormField>
    
    <FormField>
      <FormLabel>Last Name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
      <FormMessage />
    </FormField>
  </div>
  
  <FormField>
    <FormLabel>Description</FormLabel>
    <FormControl>
      <Textarea className="min-h-[100px]" />
    </FormControl>
    <FormMessage />
  </FormField>
  
  <div className="flex justify-end space-x-2">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

### Navigation Patterns

```jsx
// Header navigation
<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <Logo />
      <nav className="hidden md:flex items-center space-x-6">
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/paths">Learning Paths</NavLink>
      </nav>
      <div className="flex items-center space-x-2">
        <SearchBar />
        <MobileMenu />
      </div>
    </div>
  </div>
</header>
```

### Loading States

```jsx
// Skeleton loading
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-8 w-24" />
</div>

// Button loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

## Performance Considerations

### Bundle Size Optimization

1. **Purge Unused Classes**: Tailwind automatically removes unused utilities
2. **Component Variants**: Use CVA (Class Variance Authority) for component variants
3. **Dynamic Classes**: Ensure dynamic classes are included in purge safelist

### Runtime Performance

```jsx
// Avoid excessive class concatenation
// ✅ Good
const buttonClass = cn(baseClasses, variantClasses[variant])

// ❌ Avoid
const buttonClass = `${baseClasses} ${isActive ? activeClasses : ''} ${isDisabled ? disabledClasses : ''}`
```

### Critical CSS

```css
/* Inline critical styles for above-the-fold content */
.hero-section {
  @apply min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary;
}
```

## Troubleshooting

### Common Issues

1. **Colors not working**: Ensure CSS custom properties are defined
2. **Dark mode not switching**: Check theme provider implementation
3. **Responsive classes not applying**: Verify breakpoint syntax
4. **Custom styles not loading**: Check @layer directive usage

### Debugging Tools

```jsx
// Add debug borders
<div className="border border-red-500"> // Temporary debugging

// Check applied classes
<div className="bg-primary" data-debug="bg-primary">

// Use Tailwind's debug screens
<div className="debug-screens"> // Shows current breakpoint
```

## Migration Guide

### From Custom CSS to Tailwind

```css
/* Before: Custom CSS */
.button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.button:hover {
  background-color: #2563eb;
}
```

```jsx
// After: Tailwind classes
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
  Button
</button>

// Better: Using design tokens
<Button variant="default">Button</Button>
```

### Updating Components

1. Replace custom CSS classes with Tailwind utilities
2. Use semantic color tokens instead of hardcoded colors
3. Implement proper responsive design patterns
4. Add dark mode support using theme variables

This styling guide ensures consistent, maintainable, and performant styling across the LabDojo Learning Platform. Follow these conventions to create a cohesive user experience while maintaining code quality and developer productivity.
