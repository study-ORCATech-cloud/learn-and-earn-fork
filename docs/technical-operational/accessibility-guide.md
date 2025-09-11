
# Accessibility Guide

This guide outlines the accessibility standards, implementation practices, and testing procedures for the LabDojo Learning Platform to ensure an inclusive learning experience for all users.

## Table of Contents

1. [Overview](#overview)
2. [WCAG Compliance](#wcag-compliance)
3. [Accessibility Standards](#accessibility-standards)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Component Accessibility](#component-accessibility)
6. [Testing Procedures](#testing-procedures)
7. [Tools and Resources](#tools-and-resources)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Best Practices](#best-practices)
10. [Maintenance and Updates](#maintenance-and-updates)

## Overview

The LabDojo Learning Platform is committed to providing an accessible learning environment that meets or exceeds Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. This ensures that users with disabilities can effectively navigate, understand, and interact with all platform features.

### Accessibility Goals

- **Perceivable**: Information and UI components must be presentable in ways users can perceive
- **Operable**: UI components and navigation must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for interpretation by assistive technologies

## WCAG Compliance

### WCAG 2.1 Level AA Requirements

#### Perceivable
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Text Scaling**: Content must be readable at 200% zoom without horizontal scrolling
- **Alternative Text**: All images must have descriptive alt text
- **Captions**: Video content must include captions or transcripts

#### Operable
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Focus Indicators**: Clear visual focus indicators for all interactive elements
- **No Seizures**: Content must not cause seizures or physical reactions
- **Time Limits**: Sufficient time provided for reading content

#### Understandable
- **Language**: Page language must be programmatically determinable
- **Consistent Navigation**: Navigation must be consistent across pages
- **Error Prevention**: Forms must provide error prevention and correction

#### Robust
- **Valid Code**: HTML must be valid and semantic
- **Assistive Technology**: Compatible with screen readers and other AT

## Accessibility Standards

### Semantic HTML

Use proper HTML elements for their intended purpose:

```html
<!-- Correct semantic structure -->
<main>
  <section aria-labelledby="courses-heading">
    <h2 id="courses-heading">Featured Courses</h2>
    <article>
      <h3>Python Fundamentals</h3>
      <p>Learn Python programming from scratch</p>
    </article>
  </section>
</main>

<!-- Avoid generic divs for semantic content -->
<div class="main-content"> <!-- Should be <main> -->
  <div class="section"> <!-- Should be <section> -->
    <div class="heading">Courses</div> <!-- Should be <h2> -->
  </div>
</div>
```

### ARIA Labels and Roles

Enhance semantic meaning with ARIA attributes:

```html
<!-- Navigation with proper labeling -->
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/" role="menuitem" aria-current="page">Home</a>
    </li>
  </ul>
</nav>

<!-- Form with proper labeling -->
<form aria-labelledby="contact-form-title">
  <h2 id="contact-form-title">Contact Us</h2>
  <label for="email">Email Address</label>
  <input type="email" id="email" aria-required="true" aria-describedby="email-help">
  <div id="email-help">We'll never share your email</div>
</form>
```

### Color and Contrast

Follow color contrast requirements:

```css
/* High contrast color combinations */
.text-primary {
  color: hsl(222.2 84% 4.9%); /* Dark text */
  background: hsl(0 0% 100%); /* White background */
  /* Contrast ratio: 19.63:1 (Exceeds AA) */
}

.text-on-primary {
  color: hsl(210 40% 98%); /* Light text */
  background: hsl(222.2 47.4% 11.2%); /* Dark background */
  /* Contrast ratio: 12.63:1 (Exceeds AA) */
}

/* Error states with sufficient contrast */
.error-text {
  color: hsl(0 84.2% 60.2%); /* Error red */
  background: hsl(0 0% 100%); /* White background */
  /* Contrast ratio: 4.53:1 (Meets AA) */
}
```

## Implementation Guidelines

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// Custom component with keyboard support
const AccessibleButton = ({ onClick, children, ...props }) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyPress}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      {...props}
    >
      {children}
    </button>
  );
};

// Skip link implementation
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
  >
    Skip to main content
  </a>
);
```

### Screen Reader Support

Provide proper context for screen readers:

```tsx
// Course card with screen reader support
const CourseCard = ({ course }) => (
  <article
    className="border rounded-lg p-4"
    aria-labelledby={`course-${course.id}-title`}
    aria-describedby={`course-${course.id}-description`}
  >
    <h3 id={`course-${course.id}-title`}>{course.title}</h3>
    <p id={`course-${course.id}-description`}>{course.description}</p>
    
    <div className="flex gap-2 mt-2">
      <span className="sr-only">Course level:</span>
      <Badge variant="secondary">{course.level}</Badge>
      
      <span className="sr-only">Duration:</span>
      <Badge variant="outline">{course.duration}</Badge>
    </div>
    
    <Button
      className="mt-4"
      aria-describedby={`course-${course.id}-title`}
    >
      Start Course
      <span className="sr-only">: {course.title}</span>
    </Button>
  </article>
);
```

### Form Accessibility

Create accessible forms with proper validation:

```tsx
// Accessible form component
const ContactForm = () => {
  const [errors, setErrors] = useState({});

  return (
    <form
      aria-labelledby="contact-form-title"
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 id="contact-form-title">Contact Form</h2>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name
                <span aria-label="required" className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </FormControl>
              <FormMessage id="name-error" />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </div>
    </form>
  );
};
```

## Component Accessibility

### Navigation Components

```tsx
// Accessible navigation with proper ARIA
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav aria-label="Main navigation" role="navigation">
      <ul className="flex space-x-4" role="menubar">
        {navItems.map((item) => (
          <li key={item.path} role="none">
            <Link
              to={item.path}
              role="menuitem"
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={cn(
                "px-3 py-2 rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Modal and Dialog Accessibility

```tsx
// Accessible modal implementation
const AccessibleModal = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();
  const descriptionId = useId();
  
  useEffect(() => {
    if (isOpen) {
      // Focus management
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={modalRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle id={titleId}>{title}</DialogTitle>
        </DialogHeader>
        
        <div id={descriptionId}>
          {children}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### Loading States and Progress

```tsx
// Accessible loading indicators
const LoadingSpinner = ({ label = "Loading content" }) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="flex items-center justify-center p-4"
  >
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="sr-only">{label}</span>
  </div>
);

const ProgressIndicator = ({ value, max = 100, label }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">
        {Math.round((value / max) * 100)}%
      </span>
    </div>
    <Progress
      value={value}
      max={max}
      aria-label={`${label}: ${Math.round((value / max) * 100)}% complete`}
      className="w-full"
    />
  </div>
);
```

## Testing Procedures

### Automated Testing

#### Using axe-core for Accessibility Testing

```bash
# Install testing dependencies
npm install --save-dev @axe-core/react jest-axe
```

```tsx
// Accessibility test setup
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

// Component accessibility test
describe('CourseCard Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <CourseCard
        course={{
          id: '1',
          title: 'Test Course',
          description: 'Test description',
          level: 'Beginner'
        }}
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Lighthouse CI Integration

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Manual Testing

#### Keyboard Navigation Testing

1. **Tab Navigation**
   - Use only Tab and Shift+Tab to navigate
   - Ensure all interactive elements are reachable
   - Verify logical tab order
   - Check that focus is visible

2. **Keyboard Shortcuts**
   - Enter/Space: Activate buttons and links
   - Arrow keys: Navigate within components (menus, tabs)
   - Escape: Close modals and dropdowns
   - Home/End: Navigate to beginning/end of lists

#### Screen Reader Testing

Test with popular screen readers:

- **NVDA** (Windows, free)
- **JAWS** (Windows, commercial)
- **VoiceOver** (macOS, built-in)
- **Orca** (Linux, free)

#### Testing Checklist

```markdown
## Manual Accessibility Testing Checklist

### Visual Testing
- [ ] Text contrast meets WCAG AA standards (4.5:1 normal, 3:1 large)
- [ ] Focus indicators are clearly visible
- [ ] Content is readable at 200% zoom
- [ ] Color is not the only way to convey information

### Keyboard Testing
- [ ] All interactive elements accessible via keyboard
- [ ] Tab order is logical and intuitive
- [ ] No keyboard traps exist
- [ ] Skip links work properly

### Screen Reader Testing
- [ ] Page structure is announced correctly
- [ ] Headings create logical hierarchy
- [ ] Form labels and instructions are read
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced

### Content Testing
- [ ] Images have appropriate alt text
- [ ] Videos have captions or transcripts
- [ ] Tables have proper headers
- [ ] Lists are properly structured
```

## Tools and Resources

### Browser Extensions

- **axe DevTools** - Comprehensive accessibility testing
- **WAVE** - Web accessibility evaluation
- **Lighthouse** - Built-in Chrome accessibility audit
- **Colour Contrast Analyser** - Color contrast checking

### Online Tools

- **WebAIM Contrast Checker** - Color contrast verification
- **WAVE Web Accessibility Evaluator** - Online accessibility testing
- **Accessible Colors** - Find accessible color combinations

### Screen Reader Software

- **NVDA** - Free Windows screen reader
- **VoiceOver** - Built-in macOS/iOS screen reader
- **TalkBack** - Built-in Android screen reader

### Testing Commands

```bash
# Run accessibility tests
npm run test:a11y

# Run Lighthouse accessibility audit
npm run audit:a11y

# Check color contrast
npm run contrast:check

# Validate HTML
npm run validate:html
```

## Common Issues and Solutions

### Issue: Missing Alt Text

**Problem**: Images without alternative text
```html
<!-- Problematic -->
<img src="course-thumbnail.jpg" />
```

**Solution**: Add descriptive alt text
```html
<!-- Fixed -->
<img src="course-thumbnail.jpg" alt="Python programming course thumbnail showing code editor" />

<!-- Decorative images -->
<img src="decoration.jpg" alt="" role="presentation" />
```

### Issue: Poor Color Contrast

**Problem**: Insufficient contrast between text and background
```css
/* Problematic - Contrast ratio 2.3:1 */
.low-contrast {
  color: #666666;
  background: #ffffff;
}
```

**Solution**: Use colors with sufficient contrast
```css
/* Fixed - Contrast ratio 4.54:1 */
.good-contrast {
  color: hsl(0 0% 20%);
  background: hsl(0 0% 100%);
}
```

### Issue: Keyboard Trap

**Problem**: Users can't navigate away from a component
```tsx
// Problematic - Focus trapped in modal
const BrokenModal = ({ isOpen }) => (
  <div className={isOpen ? 'block' : 'hidden'}>
    <input /> {/* Can't tab away from here */}
  </div>
);
```

**Solution**: Implement proper focus management
```tsx
// Fixed - Proper focus management
const AccessibleModal = ({ isOpen, onClose }) => {
  const [focusedElement, setFocusedElement] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setFocusedElement(document.activeElement);
    } else if (focusedElement) {
      focusedElement.focus();
    }
  }, [isOpen]);
  
  // Implementation with proper focus trap
};
```

### Issue: Missing Form Labels

**Problem**: Form inputs without proper labels
```html
<!-- Problematic -->
<input type="email" placeholder="Enter email" />
```

**Solution**: Add explicit labels
```html
<!-- Fixed -->
<label for="email">Email Address</label>
<input type="email" id="email" placeholder="Enter your email address" />
```

## Best Practices

### Content Structure

1. **Use Semantic HTML**
   - Choose HTML elements based on meaning, not appearance
   - Use headings (h1-h6) to create document outline
   - Use lists (ul, ol) for grouped content

2. **Provide Context**
   - Add landmarks (main, nav, aside, footer)
   - Use descriptive link text
   - Group related form fields with fieldset/legend

### Interaction Design

1. **Focus Management**
   - Provide visible focus indicators
   - Manage focus in dynamic content
   - Return focus to trigger element after modal closes

2. **Error Handling**
   - Provide clear error messages
   - Associate errors with form fields
   - Announce errors to screen readers

### Content Guidelines

1. **Writing**
   - Use clear, simple language
   - Avoid jargon and acronyms
   - Provide definitions for technical terms

2. **Media**
   - Provide captions for videos
   - Include audio descriptions when needed
   - Use meaningful alt text for images

## Maintenance and Updates

### Regular Audits

Schedule regular accessibility audits:

- **Monthly**: Automated testing with axe-core
- **Quarterly**: Manual testing with screen readers
- **Annually**: Comprehensive WCAG compliance review

### Team Training

Ensure team members understand accessibility:

- Regular training sessions on WCAG guidelines
- Code review checklist including accessibility
- Accessibility champion program

### Documentation Updates

Keep accessibility documentation current:

- Update guidelines when adding new components
- Document accessibility decisions and rationale
- Maintain testing procedures and checklists

### Accessibility Statement

Provide an accessibility statement on the platform:

```markdown
## Accessibility Statement

The LabDojo Learning Platform is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

### Conformance Status
This website aims to conform to WCAG 2.1 Level AA standards.

### Feedback
If you encounter any accessibility barriers, please contact us at accessibility@labdojo.edu

### Date
This statement was last updated on [Date].
```

## Conclusion

Accessibility is an ongoing commitment that requires continuous attention and improvement. By following these guidelines and regularly testing our platform, we ensure that the LabDojo Learning Platform remains accessible to all learners, regardless of their abilities or the assistive technologies they use.

Remember that accessibility benefits everyone - clear navigation, good contrast, and semantic structure improve the experience for all users, not just those with disabilities.
