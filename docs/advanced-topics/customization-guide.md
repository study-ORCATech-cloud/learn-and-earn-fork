
# Customization Guide

This guide provides comprehensive instructions for customizing themes, layouts, and branding in the ORCATech Learning Platform. Learn how to adapt the platform to match your organization's visual identity and requirements.

## Table of Contents

1. [Overview](#overview)
2. [Theme Customization](#theme-customization)
3. [Color System](#color-system)
4. [Typography Customization](#typography-customization)
5. [Layout Customization](#layout-customization)
6. [Component Theming](#component-theming)
7. [Logo and Branding](#logo-and-branding)
8. [Dark Mode Configuration](#dark-mode-configuration)
9. [Custom CSS Variables](#custom-css-variables)
10. [Layout Templates](#layout-templates)
11. [Responsive Customization](#responsive-customization)
12. [Animation Customization](#animation-customization)
13. [Advanced Customization](#advanced-customization)
14. [Brand Guidelines](#brand-guidelines)
15. [Deployment Considerations](#deployment-considerations)

## Overview

The ORCATech Learning Platform uses a flexible theming system based on:

- **CSS Custom Properties** for dynamic theming
- **Tailwind CSS** for utility-first styling
- **HSL Color System** for better color manipulation
- **Semantic Design Tokens** for consistent theming
- **Component-based Architecture** for modular customization

### Key Files for Customization

```
src/
├── index.css              # Main theme definitions
├── components/
│   └── layout/
│       └── Logo.tsx       # Logo component
├── tailwind.config.ts     # Tailwind configuration
└── App.css               # Legacy styles (minimal usage)
```

## Theme Customization

### Basic Theme Setup

The main theme configuration is in `src/index.css`:

```css
@layer base {
  :root {
    /* Primary brand colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    /* Secondary colors */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    /* Accent colors */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    /* Status colors */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    /* UI elements */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

### Creating Custom Color Schemes

#### 1. Corporate Blue Theme

```css
:root {
  --background: 0 0% 100%;
  --foreground: 210 40% 8%;
  --primary: 213 94% 68%;        /* Corporate blue */
  --primary-foreground: 0 0% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 213 94% 68%;
  --accent: 213 94% 95%;
  --accent-foreground: 213 94% 68%;
  --destructive: 0 84% 60%;
  --border: 213 27% 84%;
}
```

#### 2. Green Tech Theme

```css
:root {
  --background: 0 0% 100%;
  --foreground: 160 84% 4%;
  --primary: 142 76% 36%;         /* Green primary */
  --primary-foreground: 0 0% 98%;
  --secondary: 142 33% 94%;
  --secondary-foreground: 142 76% 36%;
  --accent: 142 76% 95%;
  --accent-foreground: 142 76% 36%;
  --destructive: 0 84% 60%;
  --border: 142 33% 84%;
}
```

#### 3. Purple Innovation Theme

```css
:root {
  --background: 0 0% 100%;
  --foreground: 270 84% 4%;
  --primary: 262 83% 58%;         /* Purple primary */
  --primary-foreground: 0 0% 98%;
  --secondary: 270 33% 94%;
  --secondary-foreground: 262 83% 58%;
  --accent: 262 83% 95%;
  --accent-foreground: 262 83% 58%;
  --destructive: 0 84% 60%;
  --border: 270 33% 84%;
}
```

### Implementing Theme Variants

Create multiple theme variants by extending the CSS:

```css
/* Default theme */
:root {
  /* ... default colors ... */
}

/* Corporate theme */
[data-theme="corporate"] {
  --primary: 213 94% 68%;
  --primary-foreground: 0 0% 98%;
  /* ... other corporate colors ... */
}

/* Eco theme */
[data-theme="eco"] {
  --primary: 142 76% 36%;
  --primary-foreground: 0 0% 98%;
  /* ... other eco colors ... */
}
```

## Color System

### Understanding HSL Values

All colors use HSL format for better manipulation:

```css
/* HSL Format: hue saturation lightness */
--primary: 213 94% 68%;
/*         ↑   ↑   ↑
          hue sat light */
```

### Color Palette Generator

Use this approach to generate consistent color palettes:

```css
:root {
  /* Base hue (change this to shift entire palette) */
  --hue-primary: 213;
  --hue-secondary: 210;
  
  /* Calculated colors */
  --primary: var(--hue-primary) 94% 68%;
  --primary-light: var(--hue-primary) 94% 78%;
  --primary-dark: var(--hue-primary) 94% 58%;
  
  --secondary: var(--hue-secondary) 40% 96%;
  --secondary-light: var(--hue-secondary) 40% 98%;
  --secondary-dark: var(--hue-secondary) 40% 90%;
}
```

### Status Colors

Customize status colors for consistent feedback:

```css
:root {
  /* Success states */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 98%;
  
  /* Warning states */
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 98%;
  
  /* Error states */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  
  /* Info states */
  --info: 204 94% 94%;
  --info-foreground: 204 94% 20%;
}
```

## Typography Customization

### Font Configuration

Update `tailwind.config.ts` to use custom fonts:

```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'sans-serif'
        ],
        heading: [
          'Poppins', 
          'system-ui', 
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono', 
          'Consolas', 
          'monospace'
        ],
      },
    },
  },
}
```

### Adding Google Fonts

Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Typography Scale Customization

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
}
```

## Layout Customization

### Container Sizes

Customize container widths in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',      // Custom max-width
      },
    },
  },
}
```

### Grid System Customization

```typescript
export default {
  theme: {
    extend: {
      gridTemplateColumns: {
        // Custom grid layouts
        'sidebar': '250px 1fr',
        'main': '1fr 300px',
        'course': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      gridTemplateRows: {
        'layout': 'auto 1fr auto',
      },
    },
  },
}
```

### Spacing Scale

```typescript
export default {
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',     // 72px
        '72': '18rem',      // 288px
        '84': '21rem',      // 336px
        '96': '24rem',      // 384px
      },
    },
  },
}
```

## Component Theming

### Button Customization

Create custom button variants by modifying the button component:

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Custom variants
        gradient: "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90",
        rounded: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Custom sizes
        xl: "h-12 rounded-md px-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Card Customization

```tsx
// Custom card variants
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-lg border-0",
        outlined: "border-2 border-primary/20",
        glass: "backdrop-blur-sm bg-background/80 border-border/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

## Logo and Branding

### Logo Component Customization

Update `src/components/layout/Logo.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      {/* Image logo */}
      <img 
        src="/assets/your-logo.png" 
        alt="Your Brand" 
        className="h-8 w-auto"
      />
      
      {/* Text logo */}
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        YourBrand
      </span>
    </Link>
  );
};

export default Logo;
```

### Brand Color Integration

```tsx
// Gradient logo with custom colors
const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-75"></div>
        <div className="relative bg-background rounded-lg p-2">
          <YourLogoIcon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <span className="text-xl font-bold text-foreground">
        YourBrand
      </span>
    </Link>
  );
};
```

### Favicon Customization

Update `index.html`:

```html
<link rel="icon" href="/assets/your-favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/your-apple-touch-icon.png">
```

## Dark Mode Configuration

### Enhanced Dark Mode

```css
/* Enhanced dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Theme Switching

```tsx
// Theme switcher component
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const [theme, setTheme] = React.useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
};
```

## Custom CSS Variables

### Extended Color Variables

```css
:root {
  /* Extended brand colors */
  --brand-primary: 213 94% 68%;
  --brand-secondary: 142 76% 36%;
  --brand-tertiary: 38 92% 50%;
  
  /* Gradient definitions */
  --gradient-primary: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)));
  --gradient-secondary: linear-gradient(135deg, hsl(var(--brand-secondary)), hsl(var(--brand-tertiary)));
  
  /* Shadow definitions */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Animation durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### Using Custom Variables

```css
/* Custom utility classes */
@layer utilities {
  .gradient-primary {
    background: var(--gradient-primary);
  }
  
  .gradient-secondary {
    background: var(--gradient-secondary);
  }
  
  .shadow-brand {
    box-shadow: 0 4px 14px 0 hsl(var(--brand-primary) / 0.15);
  }
  
  .transition-brand {
    transition-duration: var(--duration-normal);
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

## Layout Templates

### Header Layouts

#### Centered Navigation

```tsx
const CenteredHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 relative">
          <div className="absolute left-0">
            <Logo />
          </div>
          <Navigation />
          <div className="absolute right-0 flex items-center space-x-2">
            <SearchBar />
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
```

#### Split Navigation

```tsx
const SplitHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Logo />
            <Navigation />
          </div>
          <div className="flex items-center space-x-2">
            <SearchBar />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
```

### Content Layouts

#### Sidebar Layout

```tsx
const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted/50 border-r">
        <div className="p-4">
          <SidebarNavigation />
        </div>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
```

#### Grid Layout

```tsx
const GridLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {children}
        </div>
        <aside className="space-y-6">
          <SidebarContent />
        </aside>
      </div>
    </div>
  );
};
```

## Responsive Customization

### Custom Breakpoints

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Custom breakpoints
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
  },
}
```

### Responsive Typography

```css
/* Fluid typography */
.fluid-text-xl {
  font-size: clamp(1.25rem, 2.5vw, 2rem);
}

.fluid-text-2xl {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}

.fluid-text-3xl {
  font-size: clamp(1.875rem, 4vw, 3rem);
}
```

## Animation Customization

### Custom Animations

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        'bounce-in': {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
    },
  },
}
```

### Animation Utilities

```css
@layer utilities {
  .animate-delay-100 {
    animation-delay: 100ms;
  }
  
  .animate-delay-200 {
    animation-delay: 200ms;
  }
  
  .animate-delay-300 {
    animation-delay: 300ms;
  }
  
  .hover-lift {
    transition: transform 0.2s ease-in-out;
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
  }
}
```

## Advanced Customization

### CSS-in-JS Integration

```tsx
// Using styled-components with theme
import styled from 'styled-components';

const StyledCard = styled.div`
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    transition: all var(--duration-normal);
  }
`;
```

### Dynamic Theme Loading

```tsx
// Dynamic theme loader
const loadTheme = async (themeName: string) => {
  try {
    const theme = await import(`./themes/${themeName}.css`);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.default;
    document.head.appendChild(link);
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
};
```

### Component Variants System

```tsx
// Advanced component variant system
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-lg border-0',
        outlined: 'border-2 border-primary/20',
        glass: 'backdrop-blur-sm bg-background/80 border-border/20',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        variant: 'elevated',
        size: 'lg',
        class: 'shadow-xl',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'lg',
    },
  }
);

interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = ({ className, variant, size, rounded, ...props }: CardProps) => {
  return (
    <div
      className={cardVariants({ variant, size, rounded, className })}
      {...props}
    />
  );
};
```

## Brand Guidelines

### Color Usage Guidelines

```css
/* Primary colors - Use for main actions and branding */
.text-brand-primary { color: hsl(var(--brand-primary)); }
.bg-brand-primary { background-color: hsl(var(--brand-primary)); }

/* Secondary colors - Use for supporting elements */
.text-brand-secondary { color: hsl(var(--brand-secondary)); }
.bg-brand-secondary { background-color: hsl(var(--brand-secondary)); }

/* Accent colors - Use sparingly for highlights */
.text-brand-accent { color: hsl(var(--brand-tertiary)); }
.bg-brand-accent { background-color: hsl(var(--brand-tertiary)); }
```

### Typography Hierarchy

```css
/* Heading styles */
.heading-hero {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight;
}

.heading-section {
  @apply text-2xl md:text-3xl font-semibold tracking-tight;
}

.heading-subsection {
  @apply text-xl md:text-2xl font-medium;
}

/* Body text styles */
.body-large {
  @apply text-lg leading-relaxed;
}

.body-regular {
  @apply text-base leading-relaxed;
}

.body-small {
  @apply text-sm leading-relaxed;
}

/* Special text styles */
.text-gradient {
  @apply bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent;
}
```

### Spacing System

```css
/* Consistent spacing scale */
.space-section {
  @apply py-12 md:py-16 lg:py-20;
}

.space-component {
  @apply py-6 md:py-8;
}

.space-element {
  @apply py-3 md:py-4;
}
```

## Deployment Considerations

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
        cssnano({ preset: 'default' }),
      ],
    },
  },
});
```

### Theme Validation

```tsx
// Theme validation utility
const validateTheme = (theme: Record<string, string>) => {
  const requiredColors = [
    'background',
    'foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
  ];
  
  const missingColors = requiredColors.filter(
    color => !theme[color]
  );
  
  if (missingColors.length > 0) {
    console.warn('Missing theme colors:', missingColors);
  }
  
  return missingColors.length === 0;
};
```

### Performance Monitoring

```tsx
// Theme performance monitoring
const measureThemeLoad = (themeName: string) => {
  const start = performance.now();
  
  // Load theme
  loadTheme(themeName).then(() => {
    const end = performance.now();
    console.log(`Theme ${themeName} loaded in ${end - start}ms`);
  });
};
```

## Troubleshooting

### Common Issues

1. **Colors not applying**: Ensure HSL format is correct
2. **Dark mode not working**: Check class application
3. **Fonts not loading**: Verify font URLs and fallbacks
4. **Layout breaking**: Check container classes and responsive breakpoints
5. **Animations not smooth**: Verify transition properties

### Debug Tools

```css
/* Debug borders for layout issues */
.debug * {
  outline: 1px solid red;
}

.debug-grid {
  background-image: 
    linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Testing Customizations

```tsx
// Theme testing component
const ThemeTest = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-20 bg-primary rounded flex items-center justify-center text-primary-foreground">
          Primary
        </div>
        <div className="h-20 bg-secondary rounded flex items-center justify-center text-secondary-foreground">
          Secondary
        </div>
        <div className="h-20 bg-accent rounded flex items-center justify-center text-accent-foreground">
          Accent
        </div>
        <div className="h-20 bg-destructive rounded flex items-center justify-center text-destructive-foreground">
          Destructive
        </div>
      </div>
      
      <div className="space-y-2">
        <Button variant="default">Default Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>
    </div>
  );
};
```

This customization guide provides comprehensive instructions for adapting the ORCATech Learning Platform to match any brand or design requirements. Use these patterns and examples as starting points for your specific customization needs.
